import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiFetch } from '../src/index';

afterEach(() => { vi.restoreAllMocks(); });

describe('apiFetch()', () => {
  it('returns payload on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok:   true,
      json: () => Promise.resolve({ id: 1, name: 'Alice' }),
    }));

    const { payload, error } = await apiFetch<{ id: number; name: string }>('/api/user');
    expect(error).toBeNull();
    expect(payload).toEqual({ id: 1, name: 'Alice' });
  });

  it('returns error on non-ok response', async () => {
    const apiError = [Date.now(), 404, 'E_NOT_FOUND', {}];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok:   false,
      json: () => Promise.resolve(apiError),
    }));

    const { payload, error } = await apiFetch('/api/missing');
    expect(payload).toBeNull();
    expect(error?.[2]).toBe('E_NOT_FOUND');
  });

  it('returns E_NETWORK_ERROR on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('net::ERR_FAILED')));
    const { payload, error } = await apiFetch('/api/broken');
    expect(payload).toBeNull();
    expect(error?.[2]).toBe('E_NETWORK_ERROR');
    expect(error?.[1]).toBe(500);
  });

  it('returns E_ABORTED when signal is aborted', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortError));

    const controller = new AbortController();
    const { error } = await apiFetch('/api/slow', null, { signal: controller.signal });
    expect(error?.[2]).toBe('E_ABORTED');
    expect(error?.[1]).toBe(0);
  });

  it('uses GET method when specified', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true, json: () => Promise.resolve([]),
    });
    vi.stubGlobal('fetch', mockFetch);

    await apiFetch('/api/items', null, { method: 'GET' });
    expect(mockFetch).toHaveBeenCalledWith('/api/items', expect.objectContaining({
      method: 'GET',
      body:   undefined,
    }));
  });
});
