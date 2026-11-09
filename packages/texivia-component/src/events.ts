/**
 * Global event delegation.
 *
 * One capture-phase listener per event type on document. Capture runs before
 * the event reaches the target, so `.stop` (stopPropagation) keeps it from all
 * later listeners, and non-bubbling events (focus, blur) are delegated too.
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
let _listeners: Array<{ root: Document | HTMLElement; type: string; fn: (e: Event) => void }> = [];

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
    const fn = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.('[data-eid]') as HTMLElement | null;
      if (!el) return;
      const handler = _handlers.get(el.dataset.eid!);
      if (handler) handler(e);
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
