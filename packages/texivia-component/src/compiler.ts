/**
 * Template compiler.
 *
 * Pass 1 — @bind="key"
 *   Injects the current value into the DOM attribute and registers a
 *   write-back handler. Runs before pass 2 so injected value="…" attrs
 *   are never misread as @event directives.
 *
 *   <input type="text"     @bind="email">          → value injected + data-eid
 *   <input type="checkbox" @bind="active">          → checked injected + data-eid
 *   <input type="radio"    @bind="size" value="M">  → checked if match
 *   <textarea              @bind="bio">             → inner text replaced
 *   <select                @bind="country">         → matching <option> selected
 *
 * Pass 2 — @event[.modifier…]="handler"
 *   <button @click="save">           → data-eid
 *   <form   @submit.prevent="send">  → data-eid, calls e.preventDefault()
 *   Modifiers: .prevent  .stop  .once
 *
 * .once is implemented with a consumed flag per registration — correct
 * across re-renders because each render creates a fresh handler closure.
 */

import type { Scope } from './events';

type MethodFn = (ctx: unknown, e: Event) => void;

export interface CompilerContext {
  getState:  (key: string) => unknown;
  setState:  (key: string, value: unknown) => void;
  getMethod: (name: string) => MethodFn | undefined;
  ctx:       unknown;
  scope:     Scope;
}

// ─── Pass 1: @bind ────────────────────────────────────────────────────────────

export function compileBind(html: string, cc: CompilerContext): string {
  // <input @bind="key" …>
  html = html.replace(
    /(<input[^>]*?)@bind="(\w+)"([^>]*?>)/gi,
    (_, before: string, key: string, after: string) => {
      const tag        = before + after;
      const isCheckbox = /type\s*=\s*["']checkbox["']/i.test(tag);
      const isRadio    = /type\s*=\s*["']radio["']/i.test(tag);
      const value      = cc.getState(key);

      const eid = cc.scope.register((e: Event) => {
        const target = e.target as HTMLInputElement;
        cc.setState(key, isCheckbox ? target.checked : target.value);
      });

      if (isCheckbox) {
        const checked = value ? 'checked' : '';
        return `${before}${checked} data-eid="${eid}"${after}`;
      }

      if (isRadio) {
        const radioVal = (tag.match(/value\s*=\s*["']([^"']*)["']/i) ?? [])[1] ?? '';
        const checked  = String(value) === radioVal ? 'checked' : '';
        return `${before}${checked} data-eid="${eid}"${after}`;
      }

      return `${before}value="${value ?? ''}" data-eid="${eid}"${after}`;
    }
  );

  // <textarea @bind="key" …>…</textarea>
  html = html.replace(
    /(<textarea[^>]*)@bind="(\w+)"([^>]*>)[\s\S]*?<\/textarea>/gi,
    (_, open: string, key: string, rest: string) => {
      const value = cc.getState(key) ?? '';
      const eid   = cc.scope.register((e: Event) => {
        cc.setState(key, (e.target as HTMLTextAreaElement).value);
      });
      return `${open}data-eid="${eid}"${rest}${value}</textarea>`;
    }
  );

  // <select @bind="key" …>…</select>
  html = html.replace(
    /(<select[^>]*)@bind="(\w+)"([^>]*>)([\s\S]*?)<\/select>/gi,
    (_, open: string, key: string, rest: string, options: string) => {
      const value   = cc.getState(key) ?? '';
      const eid     = cc.scope.register((e: Event) => {
        cc.setState(key, (e.target as HTMLSelectElement).value);
      });
      const patched = options.replace(
        /(<option[^>]*value\s*=\s*["']([^"']*)["'][^>]*>)/gi,
        (optTag: string, _full: string, optVal: string) =>
          optVal === String(value) ? optTag.replace('>', ' selected>') : optTag
      );
      return `${open}data-eid="${eid}"${rest}${patched}</select>`;
    }
  );

  return html;
}

// ─── Pass 2: @event[.modifiers] ──────────────────────────────────────────────

export function compileEvents(html: string, cc: CompilerContext): string {
  return html.replace(
    /@([\w.]+)="(\w+)"/g,
    (_, directive: string, name: string) => {
      const [, ...modifiers] = directive.split('.');
      const prevent  = modifiers.includes('prevent');
      const stop     = modifiers.includes('stop');
      const once     = modifiers.includes('once');
      let   consumed = false;

      const eid = cc.scope.register((e: Event) => {
        if (once && consumed) return;
        if (once) consumed = true;

        if (prevent) e.preventDefault();
        if (stop)    e.stopPropagation();

        const fn = cc.getMethod(name);
        if (fn) fn(cc.ctx, e);
        else console.warn(`[texivia-component] unknown handler: "${name}"`);
      });

      return `data-eid="${eid}"`;
    }
  );
}

export function compile(html: string, cc: CompilerContext): string {
  return compileEvents(compileBind(html, cc), cc);
}
