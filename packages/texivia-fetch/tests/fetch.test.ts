import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiFetch } from '../src/index';

afterEach(() => { vi.unstubAllGlobals(); });

function respond(body: string | null, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status })));
}

describe('apiFetch()', () => {
  it('returns payload on success', async () => {
    respond(JSON.stringify({ id: 1, name: 'Alice' }));
    const { payload, error } = await apiFetch<{ id: number; name: string }>('/api/user');
    expect(error).toBeNull();
    expect(payload).toEqual({ id: 1, name: 'Alice' });
  });

  it('returns null payload and no error for 204 No Content', async () => {
    respond(null, 204);
    const { payload, error } = await apiFetch('/api/delete');
    expect(error).toBeNull();
    expect(payload).toBeNull();
  });

  it('returns E_INVALID_JSON with the HTTP status for a 2xx body that is not JSON', async () => {
    respond('<html>', 200);
    const { payload, error } = await apiFetch('/api/user');
    expect(payload).toBeNull();
    expect(error?.[1]).toBe(200);
    expect(error?.[2]).toBe('E_INVALID_JSON');
  });

  it('returns the server ApiError on non-ok response', async () => {
    respond(JSON.stringify([1700000000000, 404, 'E_NOT_FOUND', {}]), 404);
    const { payload, error } = await apiFetch('/api/missing');
    expect(payload).toBeNull();
    expect(error?.[2]).toBe('E_NOT_FOUND');
  });

  it('returns E_HTTP_ERROR with the HTTP status when the error body is not JSON', async () => {
    respond('<html>Unauthorized</html>', 401);
    const { payload, error } = await apiFetch('/api/me');
    expect(payload).toBeNull();
    expect(error?.[1]).toBe(401);
    expect(error?.[2]).toBe('E_HTTP_ERROR');
  });

  it('returns E_HTTP_ERROR for a non-ok response with a JSON body that is no ApiError', async () => {
    respond('null', 500);
    const { payload, error } = await apiFetch('/api/broken');
    expect(payload).toBeNull();
    expect(error?.[1]).toBe(500);
    expect(error?.[2]).toBe('E_HTTP_ERROR');
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
    const mockFetch = vi.fn().mockResolvedValue(new Response('[]'));
    vi.stubGlobal('fetch', mockFetch);

    await apiFetch('/api/items', null, { method: 'GET' });
    expect(mockFetch).toHaveBeenCalledWith('/api/items', expect.objectContaining({
      method: 'GET',
      body:   undefined,
    }));
  });
});
