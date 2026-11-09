/**
 * texivia-store
 *
 * Global reactive store shared across components.
 * Depends on: texivia-reactive
 */

import { reactive, batch } from 'texivia-reactive';

type Listener = () => void;

const _listeners = new Set<Listener>();

function _notify(): void {
  for (const fn of _listeners) fn();
}

/**
 * The global store. Mutate properties directly — all subscribers are notified.
 * Wrap multi-field updates in batch() to trigger a single notification.
 *
 * @example
 * import { store, batch } from 'texivia-store'
 * store.user = { name: 'Alice' }
 * batch(() => { store.theme = 'dark'; store.lang = 'de'; })
 */
export const store: Record<string, unknown> = reactive({}, _notify);

/**
 * Subscribe to store changes.
 * Returns an unsubscribe function.
 */
export function subscribe(fn: Listener): () => void {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

/**
 * Batch multiple store writes into a single notification.
 */
export function batchStore(fn: () => void): void {
  batch(fn, _notify);
}
