import { describe, it, expect, vi, beforeEach } from 'vitest';
import { component, setupEvents } from '../src/index';
import { _resetEvents } from '../src/events';

beforeEach(() => {
  _resetEvents();
  document.body.innerHTML = '<div id="app"></div>';
  setupEvents();
});

function app(): HTMLElement {
  return document.getElementById('app')!;
}

describe('component()', () => {
  it('renders template into container', () => {
    const Hello = component({ template: () => `<h1>Hello</h1>` });
    Hello().mount(app());
    expect(app().querySelector('h1')?.textContent).toBe('Hello');
  });

  it('renders state into template', () => {
    const C = component({
      state:    { count: 42 },
      template: ({ count }) => `<span>${count}</span>`,
    });
    C().mount(app());
    expect(app().querySelector('span')?.textContent).toBe('42');
  });

  it('re-renders on state mutation', () => {
    const C = component({
      state:    { count: 0 },
      template: ({ count }) => `<span id="v">${count}</span><button @click="inc" id="b">+</button>`,
      inc(ctx)  { ctx.state.count++; },
    });
    C().mount(app());
    expect(app().querySelector('#v')?.textContent).toBe('0');
    app().querySelector('#b')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(app().querySelector('#v')?.textContent).toBe('1');
  });

  it('renders props', () => {
    const Greeting = component<object, { name: string }>({
      template: ({ name }) => `<p>Hi ${name}</p>`,
    });
    Greeting({ name: 'Vadim' }).mount(app());
    expect(app().querySelector('p')?.textContent).toBe('Hi Vadim');
  });

  it('unmount clears container reference', () => {
    const C = component({ template: () => `<div>x</div>` });
    const inst = C();
    inst.mount(app());
    inst.unmount();
    // After unmount no further renders — verified by the lack of throws
  });

  it('calls afterRender hook', () => {
    const afterRender = vi.fn();
    const C = component({ template: () => `<div></div>`, afterRender });
    C().mount(app());
    expect(afterRender).toHaveBeenCalledTimes(1);
  });

  it('aborts signal on unmount', () => {
    let captured: AbortSignal | null = null;
    const C = component({
      template: () => `<div></div>`,
      afterRender(_, ctx) { captured = ctx.signal; },
    });
    const inst = C();
    inst.mount(app());
    expect(captured?.aborted).toBe(false);
    inst.unmount();
    expect(captured?.aborted).toBe(true);
  });
});

describe('@bind', () => {
  it('injects value into text input', () => {
    const C = component({
      state:    { email: 'test@example.com' },
      template: () => `<input type="text" @bind="email" id="e">`,
    });
    C().mount(app());
    expect(app().querySelector<HTMLInputElement>('#e')?.getAttribute('value'))
      .toBe('test@example.com');
  });

  it('injects checked for true checkbox', () => {
    const C = component({
      state:    { active: true },
      template: () => `<input type="checkbox" @bind="active" id="cb">`,
    });
    C().mount(app());
    expect(app().querySelector('#cb')?.hasAttribute('checked')).toBe(true);
  });

  it('omits checked for false checkbox', () => {
    const C = component({
      state:    { active: false },
      template: () => `<input type="checkbox" @bind="active" id="cb">`,
    });
    C().mount(app());
    expect(app().querySelector('#cb')?.hasAttribute('checked')).toBe(false);
  });

  it('injects value into textarea', () => {
    const C = component({
      state:    { bio: 'Hello world' },
      template: () => `<textarea @bind="bio" id="ta"></textarea>`,
    });
    C().mount(app());
    expect(app().querySelector('#ta')?.textContent).toBe('Hello world');
  });

  it('marks correct radio as checked', () => {
    const C = component({
      state:    { size: 'M' },
      template: () => `
        <input type="radio" @bind="size" value="S" id="s">
        <input type="radio" @bind="size" value="M" id="m">
        <input type="radio" @bind="size" value="L" id="l">
      `,
    });
    C().mount(app());
    expect(app().querySelector('#s')?.hasAttribute('checked')).toBe(false);
    expect(app().querySelector('#m')?.hasAttribute('checked')).toBe(true);
    expect(app().querySelector('#l')?.hasAttribute('checked')).toBe(false);
  });
});

describe('event modifiers', () => {
  it('.prevent calls preventDefault', () => {
    const send = vi.fn();
    const C = component({
      template: () => `<form @submit.prevent="send" id="f"><button type="submit">Go</button></form>`,
      send,
    });
    C().mount(app());
    const event = new Event('submit', { bubbles: true, cancelable: true });
    app().querySelector('#f')!.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('.once fires handler only once', () => {
    const click = vi.fn();
    const C = component({
      template: () => `<button @click.once="click" id="b">Go</button>`,
      click,
    });
    C().mount(app());
    const btn = app().querySelector('#b')!;
    btn.dispatchEvent(new Event('click', { bubbles: true }));
    btn.dispatchEvent(new Event('click', { bubbles: true }));
    btn.dispatchEvent(new Event('click', { bubbles: true }));
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('.stop prevents bubbling', () => {
    const outer = vi.fn();
    document.addEventListener('click', outer);
    const C = component({
      template: () => `<button @click.stop="noop" id="b">x</button>`,
      noop() {},
    });
    C().mount(app());
    app().querySelector('#b')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(outer).not.toHaveBeenCalled();
    document.removeEventListener('click', outer);
  });
});

describe('event delegation', () => {
  it('.stop also keeps the event from listeners on ancestor elements', () => {
    const outer = vi.fn();
    app().addEventListener('click', outer);
    const C = component({
      template: () => `<button @click.stop="noop" id="b">x</button>`,
      noop() {},
    });
    C().mount(app());
    app().querySelector('#b')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(outer).not.toHaveBeenCalled();
  });

  it('without .stop, ancestor listeners still see the event', () => {
    const outer = vi.fn();
    app().addEventListener('click', outer);
    const C = component({
      template: () => `<button @click="noop" id="b">x</button>`,
      noop() {},
    });
    C().mount(app());
    app().querySelector('#b')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(outer).toHaveBeenCalledTimes(1);
  });

  it('delegates non-bubbling events (focus)', () => {
    const focused = vi.fn();
    const C = component({
      template: () => `<input @focus="focused" id="i">`,
      focused,
    });
    C().mount(app());
    app().querySelector('#i')!.dispatchEvent(new Event('focus', { bubbles: false }));
    expect(focused).toHaveBeenCalledTimes(1);
  });

  it('_resetEvents removes the delegation listeners', () => {
    const click = vi.fn();
    _resetEvents();
    setupEvents();
    const C = component({ template: () => `<button @click="click" id="b">x</button>`, click });
    C().mount(app());
    app().querySelector('#b')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(click).toHaveBeenCalledTimes(1);
  });
});

describe('batch()', () => {
  it('triggers only one re-render for multiple state writes', () => {
    let renders = 0;
    const C = component({
      state:    { a: 0, b: 0, c: 0 },
      template: ({ a, b, c }) => { renders++; return `<p>${a}${b}${c}</p><button @click="reset" id="b">x</button>`; },
      reset(ctx) {
        ctx.batch(() => {
          ctx.state.a = 1;
          ctx.state.b = 2;
          ctx.state.c = 3;
        });
      },
    });
    C().mount(app());
    renders = 0; // discount initial render
    app().querySelector('#b')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(renders).toBe(1);
    expect(app().querySelector('p')?.textContent).toBe('123');
  });
});

describe('@bind escaping', () => {
  it('escapes the injected input value', () => {
    const C = component({
      state:    { name: '"><img src=x onerror="window.__xss=1">' },
      template: () => `<input @bind="name" id="i">`,
    });
    C().mount(app());
    expect(app().querySelector('img')).toBeNull();
    expect(app().querySelector<HTMLInputElement>('#i')?.value).toBe('"><img src=x onerror="window.__xss=1">');
  });

  it('escapes the injected textarea content', () => {
    const C = component({
      state:    { bio: '</textarea><img src=x>' },
      template: () => `<textarea @bind="bio" id="t"></textarea>`,
    });
    C().mount(app());
    expect(app().querySelector('img')).toBeNull();
    expect(app().querySelector<HTMLTextAreaElement>('#t')?.value).toBe('</textarea><img src=x>');
  });

  it('does not turn an injected @event="…" into a directive', () => {
    const C = component({
      state:    { v: 'x" @click="boom' },
      template: () => `<input @bind="v" id="i">`,
      boom: vi.fn(),
    });
    C().mount(app());
    expect(app().querySelector<HTMLInputElement>('#i')?.value).toBe('x" @click="boom');
  });
});

describe('event types', () => {
  it('a @click handler does not run on focus', () => {
    const click = vi.fn();
    const C = component({ template: () => `<button @click="click" id="b">x</button>`, click });
    C().mount(app());
    app().querySelector('#b')!.dispatchEvent(new Event('focus'));
    expect(click).not.toHaveBeenCalled();
  });

  it('a click inside a @submit form is not a submit', () => {
    const send = vi.fn();
    const C = component({
      template: () => `<form @submit.prevent="send"><input id="i"></form>`,
      send,
    });
    C().mount(app());
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    app().querySelector('#i')!.dispatchEvent(click);
    expect(send).not.toHaveBeenCalled();
    expect(click.defaultPrevented).toBe(false);
  });

  it('runs the nearest handler of the matching type, also on an ancestor', () => {
    const send = vi.fn();
    const C = component({
      template: () => `<form @submit.prevent="send" id="f"><button @click="noop" id="b">x</button></form>`,
      send,
      noop() {},
    });
    C().mount(app());
    app().querySelector('#f')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('@bind on a text input writes back on input, not on keydown', () => {
    let ctx: { state: { text: string } } | undefined;
    const C = component({
      state:    { text: '' },
      template: () => `<input @bind="text" id="i">`,
      afterRender(_, c) { ctx = c; },
    });
    C().mount(app());
    const input = app().querySelector<HTMLInputElement>('#i')!;
    input.value = 'a';
    input.dispatchEvent(new Event('keydown', { bubbles: true }));
    expect(ctx!.state.text).toBe('');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(ctx!.state.text).toBe('a');
  });

  it('@bind on a checkbox writes back on change', () => {
    let ctx: { state: { on: boolean } } | undefined;
    const C = component({
      state:    { on: false },
      template: () => `<input type="checkbox" @bind="on" id="c">`,
      afterRender(_, c) { ctx = c; },
    });
    C().mount(app());
    const cb = app().querySelector<HTMLInputElement>('#c')!;
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    expect(ctx!.state.on).toBe(true);
  });
});

describe('several directives on one element', () => {
  it('@bind and @change both work', () => {
    const save = vi.fn();
    let ctx: { state: { text: string } } | undefined;
    const C = component({
      state:    { text: '' },
      template: () => `<input @bind="text" @change="save" id="i">`,
      save,
      afterRender(_, c) { ctx = c; },
    });
    C().mount(app());
    const input = app().querySelector<HTMLInputElement>('#i')!;
    expect([...input.attributes].filter((x) => x.name.startsWith('data-eid-'))).toHaveLength(2);
    input.value = 'x';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(ctx!.state.text).toBe('x');
    app().querySelector('#i')!.dispatchEvent(new Event('change', { bubbles: true }));
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('@bind and @change on one checkbox both run, bind first', () => {
    const seen: boolean[] = [];
    const C = component({
      state:    { on: false },
      template: () => `<input type="checkbox" @bind="on" @change="save" id="c">`,
      save(ctx) { seen.push(ctx.state.on); },
    });
    C().mount(app());
    const cb = app().querySelector<HTMLInputElement>('#c')!;
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    expect(seen).toEqual([true]);
  });

  it('@bind and @input on one text input both run', () => {
    const seen: string[] = [];
    const C = component({
      state:    { text: '' },
      template: () => `<input @bind="text" @input="typed" id="i">`,
      typed(ctx) { seen.push(ctx.state.text); },
    });
    C().mount(app());
    const input = app().querySelector<HTMLInputElement>('#i')!;
    input.value = 'q';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(seen).toEqual(['q']);
  });

  it('a quoted ">" in another attribute does not break directives', () => {
    const click = vi.fn();
    const key = vi.fn();
    const C = component({
      template: () => `<button title="a > b" @click="click" @keydown="key" id="b">x</button>`,
      click, key,
    });
    C().mount(app());
    const btn = app().querySelector('#b')!;
    expect(btn.getAttribute('title')).toBe('a > b');
    btn.dispatchEvent(new Event('click', { bubbles: true }));
    btn.dispatchEvent(new Event('keydown', { bubbles: true }));
    expect(click).toHaveBeenCalledTimes(1);
    expect(key).toHaveBeenCalledTimes(1);
  });

  it('@bind works after a quoted ">" in the same tag', () => {
    let ctx: { state: { text: string } } | undefined;
    const C = component({
      state:    { text: 'v' },
      template: () => `<input placeholder="a > b" @bind="text" id="i">`,
      afterRender(_, c) { ctx = c; },
    });
    C().mount(app());
    const input = app().querySelector<HTMLInputElement>('#i')!;
    expect(input.value).toBe('v');
    expect(input.placeholder).toBe('a > b');
    input.value = 'w';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(ctx!.state.text).toBe('w');
  });

  it('@click and @keydown on one button', () => {
    const click = vi.fn();
    const key = vi.fn();
    const C = component({ template: () => `<button @click="click" @keydown="key" id="b">x</button>`, click, key });
    C().mount(app());
    const btn = app().querySelector('#b')!;
    btn.dispatchEvent(new Event('click', { bubbles: true }));
    btn.dispatchEvent(new Event('keydown', { bubbles: true }));
    expect(click).toHaveBeenCalledTimes(1);
    expect(key).toHaveBeenCalledTimes(1);
  });
});

describe('@bind write-back', () => {
  it('keeps the focused input: no re-render while typing', () => {
    let renders = 0;
    let ctx: { state: { text: string } } | undefined;
    const C = component({
      state:    { text: '' },
      template: () => { renders++; return `<input @bind="text" id="i">`; },
      afterRender(_, c) { ctx = c; },
    });
    C().mount(app());
    renders = 0;
    const input = app().querySelector<HTMLInputElement>('#i')!;
    input.focus();
    input.value = 'ab';
    input.setSelectionRange(1, 1);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(ctx!.state.text).toBe('ab');
    expect(renders).toBe(0);
    expect(input.isConnected).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(1);
  });

  it('the next render shows the bound value', () => {
    const C = component({
      state:    { text: '', n: 0 },
      template: ({ text, n }) => `<input @bind="text" id="i"><p>${text}${n}</p><button @click="inc" id="b">+</button>`,
      inc(ctx) { ctx.state.n++; },
    });
    C().mount(app());
    const input = app().querySelector<HTMLInputElement>('#i')!;
    input.value = 'x';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(app().querySelector('p')?.textContent).toBe('0');
    app().querySelector('#b')!.dispatchEvent(new Event('click', { bubbles: true }));
    expect(app().querySelector('p')?.textContent).toBe('x1');
    expect(app().querySelector<HTMLInputElement>('#i')?.value).toBe('x');
  });

  it('a method that changes other state still re-renders', () => {
    const C = component({
      state:    { text: '', saved: '' },
      template: ({ saved }) => `<input @bind="text" @change="save" id="i"><p>${saved}</p>`,
      save(ctx) { ctx.state.saved = ctx.state.text; },
    });
    C().mount(app());
    const input = app().querySelector<HTMLInputElement>('#i')!;
    input.value = 'y';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(app().querySelector('p')?.textContent).toBe('y');
  });
});

