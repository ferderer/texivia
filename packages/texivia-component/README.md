# texivia-component

A component factory with template strings, event delegation and `@bind`. Part of the [Texivia](https://github.com/ferderer/texivia) ecosystem; depends on `texivia-reactive`.

```
npm install texivia-component
```

```ts
import { component, setupEvents } from 'texivia-component';

setupEvents();   // once at app start: installs the delegated event listeners

export const Counter = component({
  state: { count: 0 },
  template: ({ count }) => `
    <button @click="dec">−</button>
    <span>${count}</span>
    <button @click="inc">+</button>
  `,
  inc(ctx) { ctx.state.count++; },
  dec(ctx) { ctx.state.count--; },
});

const instance = Counter();
instance.mount(document.getElementById('app')!);
// later: instance.unmount();
```

| Definition | Description |
|---|---|
| `state` | initial reactive state |
| `template(state & props)` | returns an HTML string |
| `afterRender(container, ctx)` | called after each render |
| any other function | method for `@event` directives, called as `method(ctx, event)` |

`ctx` offers `ctx.state`, `ctx.props`, `ctx.batch(fn)` and `ctx.signal` (an `AbortSignal` aborted on unmount, e.g. for `apiFetch`).

Directives: `@click="method"`, with modifiers `.prevent`, `.stop`, `.once`, and `@bind="key"` for two-way binding of inputs, textareas and selects.

- A handler runs only for its own event type. The nearest element with handlers for that type runs all of them, in template order.
- Every state change re-renders the whole component (`innerHTML`). **`@bind` writes into state without re-rendering**, so the focused field keeps focus and cursor; other parts of the template show the value after the next render. Do not build live previews of bound fields.
- `@bind` HTML-escapes the value it injects. Values you interpolate with `${…}` are inserted as HTML: escape untrusted data there.

ES module and CommonJS builds, each with type declarations. Apache-2.0.
