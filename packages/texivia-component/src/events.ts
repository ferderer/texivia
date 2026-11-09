/**
 * Global event delegation.
 *
 * One capture-phase listener per event type on document. Capture runs before
 * the event reaches the target, so `.stop` (stopPropagation) keeps it from all
 * later listeners, and non-bubbling events (focus, blur) are delegated too.
 * Every directive becomes its own attribute `data-eid-<n>` (unique name, so
 * several directives on one element never collide); each points to a handler
 * for one event type. The listener for an event finds the nearest element
 * (target or ancestor) with handlers for that event type and runs all of them
 * in template order – a click inside a `@submit` form is not a submit, and
 * `@bind` plus `@change` on one checkbox both run.
 *
 * Components receive a Scope via createScope() — a scoped register/cleanup
 * pair. On unmount or re-render the scope is cleaned up, removing all
 * handlers registered through it. No leaks across navigations.
 */

type Handler = (e: Event) => void;

const PREFIX = 'data-eid-';
const _handlers = new Map<string, { type: string; fn: Handler }>();
let _id = 0;
let _installed = false;  // guard against double-installation (e.g. HMR)
let _listeners: Array<{ root: Document | HTMLElement; type: string; fn: (e: Event) => void }> = [];

export const DELEGATED_EVENTS: readonly string[] = [
  'click', 'input', 'change', 'submit',
  'keydown', 'keyup', 'focus', 'blur',
];

/**
 * Install global delegation listeners. Safe to call multiple times —
 * listeners are installed exactly once per root.
 */
export function setupEvents(root: Document | HTMLElement = document): void {
  if (_installed) return;
  _installed = true;

  for (const type of DELEGATED_EVENTS) {
    const fn = (e: Event) => {
      for (let el = e.target as Element | null; el?.attributes; el = el.parentElement) {
        const matching: Handler[] = [];
        for (const { name } of el.attributes) {
          if (!name.startsWith(PREFIX)) continue;
          const handler = _handlers.get(name);
          if (handler?.type === e.type) matching.push(handler.fn);
        }
        if (matching.length) {
          for (const h of matching) h(e);
          return;
        }
      }
    };
    root.addEventListener(type, fn, { capture: true });
    _listeners.push({ root, type, fn });
  }
}

/** Remove the delegation listeners and all handlers — used in tests only. */
export function _resetEvents(): void {
  for (const { root, type, fn } of _listeners) root.removeEventListener(type, fn, { capture: true });
  _listeners = [];
  _installed = false;
  _handlers.clear();
  _id = 0;
}

export interface Scope {
  /** Register a handler for one event type; returns the attribute name to embed in HTML. */
  register(type: string, fn: Handler): string;
  /** Remove all handlers registered through this scope. */
  cleanup(): void;
}

/**
 * Create a scoped handler registry.
 * Each component instance gets its own scope.
 */
export function createScope(): Scope {
  const keys = new Set<string>();

  return {
    register(type: string, fn: Handler): string {
      const key = PREFIX + (_id++);
      _handlers.set(key, { type, fn });
      keys.add(key);
      return key;
    },
    cleanup(): void {
      for (const k of keys) _handlers.delete(k);
      keys.clear();
    },
  };
}
