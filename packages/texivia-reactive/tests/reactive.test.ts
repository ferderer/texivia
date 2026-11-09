import { describe, it, expect, vi } from 'vitest';
import { reactive, batch } from '../src/index';

describe('reactive()', () => {
  it('calls notify on value change', () => {
    const notify = vi.fn();
    const state = reactive({ count: 0 }, notify);
    state.count = 1;
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('does not notify when value is unchanged', () => {
    const notify = vi.fn();
    const state = reactive({ count: 0 }, notify);
    state.count = 0;
    expect(notify).not.toHaveBeenCalled();
  });

  it('reflects updated values', () => {
    const state = reactive({ name: 'Alice' }, () => {});
    state.name = 'Bob';
    expect(state.name).toBe('Bob');
  });
});

describe('batch()', () => {
  it('flushes exactly once after multiple writes', () => {
    const notify = vi.fn();
    const state = reactive({ a: 0, b: 0, c: 0 }, notify);
    batch(() => {
      state.a = 1;
      state.b = 2;
      state.c = 3;
    }, notify);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('does not flush if no values changed', () => {
    const notify = vi.fn();
    const state = reactive({ x: 5 }, notify);
    batch(() => { state.x = 5; }, notify);
    expect(notify).not.toHaveBeenCalled();
  });

  it('handles nested batch — outer flushes once', () => {
    const notify = vi.fn();
    const state = reactive({ a: 0, b: 0 }, notify);
    batch(() => {
      state.a = 1;
      batch(() => { state.b = 2; }, notify);
    }, notify);
    expect(notify).toHaveBeenCalledTimes(1);
  });
});
