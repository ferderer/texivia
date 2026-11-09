/**
 * texivia-reactive
 *
 * Proxy-based reactive state with batch() support.
 * Zero dependencies.
 */

let _batching = false;
const _pending = new Set<() => void>();

/**
 * Runs fn() while suppressing intermediate notifications.
 * Afterwards calls the notify function of every reactive object that actually
 * changed, each exactly once – also for objects other than the caller's
 * (e.g. component state and the global store in one batch).
 * Safe to nest: inner calls defer to the outermost.
 *
 * @param _notify kept for compatibility; the notify functions of the changed
 *   reactive objects are called instead.
 */
export function batch(fn: () => void, _notify?: () => void): void {
  if (_batching) { fn(); return; }
  _batching = true;
  try {
    fn();
  } finally {
    _batching = false;
    const pending = [..._pending];
    _pending.clear();
    for (const n of pending) n();
  }
}

/**
 * Wraps obj in a Proxy that calls notify() on every write that changes a value.
 * Shallow — nested objects must be wrapped individually.
 */
export function reactive<T extends object>(obj: T, notify: () => void): T {
  return new Proxy({ ...obj } as T, {
    set(target: T, key: string | symbol, value: unknown): boolean {
      if ((target as Record<string | symbol, unknown>)[key] === value) return true;
      (target as Record<string | symbol, unknown>)[key] = value;
      if (_batching) _pending.add(notify);
      else notify();
      return true;
    }
  });
}

export type Reactive<T extends object> = T;
