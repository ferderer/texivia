/**
 * texivia-component
 *
 * Component factory with reactive state, declarative event binding,
 * two-way form binding, and clean lifecycle management.
 *
 * Depends on: texivia-reactive
 */

import { reactive, batch } from 'texivia-reactive';
import { createScope, setupEvents } from './events';
import { compile } from './compiler';
import type { Scope } from './events';

export { setupEvents, _resetEvents } from './events';
export type { Scope } from './events';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ComponentContext<S extends object, P extends object = object> = {
  state:  S;
  props:  P;
  batch:  (fn: () => void) => void;
  signal: AbortSignal;
};

type TemplateFn<S extends object, P extends object> =
  (data: S & P) => string;

type MethodFn<S extends object, P extends object> =
  (ctx: ComponentContext<S, P>, e?: Event) => void;

type AfterRenderFn<S extends object, P extends object> =
  (container: HTMLElement, ctx: ComponentContext<S, P>) => void;

export type ComponentDef<S extends object, P extends object = object> = {
  state?:       S;
  template:     TemplateFn<S, P>;
  afterRender?: AfterRenderFn<S, P>;
} & Record<string, MethodFn<S, P> | S | TemplateFn<S, P> | AfterRenderFn<S, P> | undefined>;

export interface ComponentInstance {
  mount(target: HTMLElement): void;
  unmount(): void;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Define a component. Returns a factory function that creates instances.
 *
 * @example
 * export const Counter = component({
 *   state: { count: 0 },
 *   template: ({ count }) => `
 *     <button @click="dec">−</button>
 *     <span>${count}</span>
 *     <button @click="inc">+</button>
 *   `,
 *   inc(ctx) { ctx.state.count++ },
 *   dec(ctx) { ctx.state.count-- },
 * })
 *
 * // In router:
 * { path: '/counter', view: Counter }
 *
 * // In app.js:
 * document.addEventListener('texivia', ({ detail: { view, params } }) => {
 *   current?.unmount()
 *   current = view(params)
 *   current.mount(document.getElementById('app'))
 * })
 */
export function component<
  S extends object = object,
  P extends object = object,
>(def: ComponentDef<S, P>) {

  return function create(props: P = {} as P): ComponentInstance {
    let container: HTMLElement | null = null;
    let scope:     Scope | null = null;
    let controller = new AbortController();

    function notify() { render(); }

    const state = reactive<S>((def.state ?? {}) as S, notify);

    const ctx: ComponentContext<S, P> = {
      state,
      props,
      signal: controller.signal,
      batch: (fn: () => void) => batch(fn, notify),
    };

    function getState(key: string): unknown {
      return (state as Record<string, unknown>)[key];
    }

    function setState(key: string, value: unknown): void {
      (state as Record<string, unknown>)[key] = value;
    }

    function getMethod(name: string): MethodFn<S, P> | undefined {
      const fn = (def as Record<string, unknown>)[name];
      return typeof fn === 'function' ? fn as MethodFn<S, P> : undefined;
    }

    function render(): void {
      if (!container) return;

      scope?.cleanup();
      scope = createScope();

      const data = { ...state, ...props } as S & P;
      const raw  = def.template(data);

      container.innerHTML = compile(raw, {
        getState,
        setState,
        getMethod,
        ctx,
        scope,
      });

      def.afterRender?.(container, ctx);
    }

    return {
      mount(target: HTMLElement): void {
        container  = target;
        controller = new AbortController();
        ctx.signal = controller.signal;
        scope      = createScope();
        render();
      },

      unmount(): void {
        controller.abort();
        scope?.cleanup();
        scope      = null;
        container  = null;
      },
    };
  };
}
