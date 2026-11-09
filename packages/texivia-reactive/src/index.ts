/**
 * texivia-reactive
 *
 * Proxy-based reactive state with batch() support.
 * Zero dependencies.
 */

let _batching = false;
let _pending  = false;

/**
 * Runs fn() while suppressing intermediate notifications.
 * Flushes exactly once after fn() returns — only if at least one
 * value actually changed. Safe to nest: inner calls defer to the outermost.
 */
export function batch(fn: () => void, notify: () => void): void {
  if (_batching) { fn(); return; }
  _batching = true;
  _pending  = false;
  try {
    fn();
  } finally {
    _batching = false;
    if (_pending) notify();
    _pending = false;
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
      if (_batching) { _pending = true; }
      else notify();
      return true;
    }
  });
}

export type Reactive<T extends object> = T;
