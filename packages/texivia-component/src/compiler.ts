/**
 * Template compiler.
 *
 * Pass 1 — @bind="key"
 *   Injects the current value into the DOM attribute and registers a
 *   write-back handler. Runs before pass 2 so injected value="…" attrs
 *   are never misread as @event directives.
 *
 *   <input type="text"     @bind="email">          → value injected, written back on input
 *   <input type="checkbox" @bind="active">          → checked injected, written back on change
 *   <input type="radio"    @bind="size" value="M">  → checked if match, written back on change
 *   <textarea              @bind="bio">             → inner text replaced, written back on input
 *   <select                @bind="country">         → matching <option> selected, written back on change
 *
 *   The write-back does not re-render the component (focus and cursor stay);
 *   other parts of the template show the new value after the next render.
 *
 *   Injected values are HTML-escaped. Values interpolated by the template
 *   itself (`${…}`) are not – escape untrusted data there.
 *
 * Pass 2 — @event[.modifier…]="handler"
 *   <button @click="save">           → data-eid-<n>
 *   <form   @submit.prevent="send">  → data-eid-<n>, calls e.preventDefault()
 *   Modifiers: .prevent  .stop  .once
 *   The handler runs only for its own event type.
 *
 * Every directive becomes its own attribute `data-eid-<n>`, so several
 * directives on one element (e.g. @bind and @change) never collide.
 *
 * .once is implemented with a consumed flag per registration — correct
 * across re-renders because each render creates a fresh handler closure.
 */

import { DELEGATED_EVENTS } from './events.js';
import type { Scope } from './events.js';

/** Escapes a value for an attribute value or element text. */
function escape(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

type MethodFn<C> = (ctx: C, e: Event) => void;

/** C is the context type passed to component methods (ComponentContext in index.ts). */
export interface CompilerContext<C = unknown> {
  getState:  (key: string) => unknown;
  setState:  (key: string, value: unknown) => void;
  getMethod: (name: string) => MethodFn<C> | undefined;
  ctx:       C;
  scope:     Scope;
}

// ─── Pass 1: @bind ────────────────────────────────────────────────────────────

/** Characters inside a start tag; quoted attribute values may contain '>'. */
const IN_TAG = `(?:[^>"']|"[^"]*"|'[^']*')`;
const BIND_INPUT    = new RegExp(`(<input${IN_TAG}*?)@bind="(\\w+)"(${IN_TAG}*?>)`, 'gi');
const BIND_TEXTAREA = new RegExp(`(<textarea${IN_TAG}*?)@bind="(\\w+)"(${IN_TAG}*?>)[\\s\\S]*?<\\/textarea>`, 'gi');
const BIND_SELECT   = new RegExp(`(<select${IN_TAG}*?)@bind="(\\w+)"(${IN_TAG}*?>)([\\s\\S]*?)<\\/select>`, 'gi');

export function compileBind<C>(html: string, cc: CompilerContext<C>): string {
  // <input @bind="key" …>
  html = html.replace(
    BIND_INPUT,
    (_, before: string, key: string, after: string) => {
      const tag        = before + after;
      const isCheckbox = /type\s*=\s*["']checkbox["']/i.test(tag);
      const isRadio    = /type\s*=\s*["']radio["']/i.test(tag);
      const value      = cc.getState(key);

      const eid = cc.scope.register(isCheckbox || isRadio ? 'change' : 'input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        cc.setState(key, isCheckbox ? target.checked : target.value);
      });

      if (isCheckbox) {
        const checked = value ? 'checked' : '';
        return `${before}${checked} ${eid}${after}`;
      }

      if (isRadio) {
        const radioVal = (tag.match(/value\s*=\s*["']([^"']*)["']/i) ?? [])[1] ?? '';
        const checked  = String(value) === radioVal ? 'checked' : '';
        return `${before}${checked} ${eid}${after}`;
      }

      return `${before}value="${escape(value)}" ${eid}${after}`;
    }
  );

  // <textarea @bind="key" …>…</textarea>
  html = html.replace(
    BIND_TEXTAREA,
    (_, open: string, key: string, rest: string) => {
      const value = cc.getState(key);
      const eid   = cc.scope.register('input', (e: Event) => {
        cc.setState(key, (e.target as HTMLTextAreaElement).value);
      });
      return `${open}${eid}${rest}${escape(value)}</textarea>`;
    }
  );

  // <select @bind="key" …>…</select>
  html = html.replace(
    BIND_SELECT,
    (_, open: string, key: string, rest: string, options: string) => {
      const value   = cc.getState(key) ?? '';
      const eid     = cc.scope.register('change', (e: Event) => {
        cc.setState(key, (e.target as HTMLSelectElement).value);
      });
      const patched = options.replace(
        /(<option[^>]*value\s*=\s*["']([^"']*)["'][^>]*>)/gi,
        (optTag: string, _full: string, optVal: string) =>
          optVal === String(value) ? optTag.replace('>', ' selected>') : optTag
      );
      return `${open}${eid}${rest}${patched}</select>`;
    }
  );

  return html;
}

// ─── Pass 2: @event[.modifiers] ──────────────────────────────────────────────

export function compileEvents<C>(html: string, cc: CompilerContext<C>): string {
  return html.replace(
    /@([\w.]+)="(\w+)"/g,
    (_, directive: string, name: string) => {
      const [type, ...modifiers] = directive.split('.');
      if (!DELEGATED_EVENTS.includes(type))
        console.warn(`[texivia-component] event not delegated: "@${type}"`);
      const prevent  = modifiers.includes('prevent');
      const stop     = modifiers.includes('stop');
      const once     = modifiers.includes('once');
      let   consumed = false;

      const eid = cc.scope.register(type, (e: Event) => {
        if (once && consumed) return;
        if (once) consumed = true;

        if (prevent) e.preventDefault();
        if (stop)    e.stopPropagation();

        const fn = cc.getMethod(name);
        if (fn) fn(cc.ctx, e);
        else console.warn(`[texivia-component] unknown handler: "${name}"`);
      });

      return eid;
    }
  );
}

export function compile<C>(html: string, cc: CompilerContext<C>): string {
  return compileEvents(compileBind(html, cc), cc);
}
