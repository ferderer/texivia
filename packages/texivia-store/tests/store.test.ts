import { describe, it, expect, vi, beforeEach } from 'vitest';
import { store, subscribe, batchStore } from '../src/index';

beforeEach(() => {
  // Clean store state between tests
  for (const key of Object.keys(store)) delete store[key];
});

describe('store', () => {
  it('notifies subscriber on write', () => {
    const fn = vi.fn();
    const unsub = subscribe(fn);
    store.user = { name: 'Alice' };
    expect(fn).toHaveBeenCalledTimes(1);
    unsub();
  });

  it('unsubscribe stops notifications', () => {
    const fn = vi.fn();
    const unsub = subscribe(fn);
    unsub();
    store.x = 1;
    expect(fn).not.toHaveBeenCalled();
  });

  it('batchStore flushes once for multiple writes', () => {
    const fn = vi.fn();
    const unsub = subscribe(fn);
    batchStore(() => {
      store.a = 1;
      store.b = 2;
    });
    expect(fn).toHaveBeenCalledTimes(1);
    unsub();
  });
});
