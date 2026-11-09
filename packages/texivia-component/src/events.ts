/**
 * Global event delegation.
 *
 * One listener per event type on document.
 * Each element carries a `data-eid` attribute pointing to a handler
 * in the registry.
 *
 * Components receive a Scope via createScope() — a scoped register/cleanup
 * pair. On unmount or re-render the scope is cleaned up, removing all
 * handlers registered through it. No leaks across navigations.
 */

type Handler = (e: Event) => void;

const _handlers = new Map<string, Handler>();
let _id = 0;
let _installed = false;  // guard against double-installation (e.g. HMR)

const DELEGATED_EVENTS = [
  'click', 'input', 'change', 'submit',
  'keydown', 'keyup', 'focus', 'blur',
] as const;

/**
 * Install global delegation listeners. Safe to call multiple times —
 * listeners are installed exactly once per root.
 */
export function setupEvents(root: Document | HTMLElement = document): void {
  if (_installed) return;
  _installed = true;

  for (const type of DELEGATED_EVENTS) {
    root.addEventListener(type, (e: Event) => {
      const el = (e.target as HTMLElement).closest('[data-eid]') as HTMLElement | null;
      if (!el) return;
      const fn = _handlers.get(el.dataset.eid!);
      if (fn) fn(e);
    }, { capture: false });
  }
}

/** Reset installation state — used in tests only. */
export function _resetEvents(): void {
  _installed = false;
  _handlers.clear();
  _id = 0;
}

export interface Scope {
  /** Register a handler; returns the data-eid key to embed in HTML. */
  register(fn: Handler): string;
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
    register(fn: Handler): string {
      const key = 'e' + (_id++);
      _handlers.set(key, fn);
      keys.add(key);
      return key;
    },
    cleanup(): void {
      for (const k of keys) _handlers.delete(k);
      keys.clear();
    },
  };
}
