import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiFetch, parseApiError } from '../src/index';

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

  describe('error formats', () => {
    const guard4j = {
      timestamp: 1700000000000,
      status: 404,
      error: { name: 'DATA_NOT_FOUND', code: 'data-not-found', message: 'Requested resource not found',
               category: 'BUSINESS', httpStatus: 404, retryable: false, severity: 'INFO' },
      data: { resource: 'order', id: '123' },
      fields: null,
    };

    it('understands the Guard4j object (code = error.name)', async () => {
      respond(JSON.stringify(guard4j), 404);
      const { error } = await apiFetch('/api/order');
      expect(error).toEqual([1700000000000, 404, 'DATA_NOT_FOUND', { resource: 'order', id: '123' }]);
    });

    it('keeps Guard4j field errors as { code, path, value }', async () => {
      respond(JSON.stringify({
        timestamp: 1, status: 422,
        error: { name: 'VALIDATION_INVALID_INPUT', code: 'validation-invalid-input' },
        data: {},
        fields: [{ code: 'NotBlank', path: 'email', value: '' }],
      }), 422);
      const { error } = await apiFetch('/api/user');
      expect(error?.[2]).toBe('VALIDATION_INVALID_INPUT');
      expect(error?.[4]).toEqual([{ code: 'NotBlank', path: 'email', value: '' }]);
    });

    it('falls back to error.code when Guard4j sends no name', async () => {
      respond(JSON.stringify({ ...guard4j, error: { code: 'data-not-found' } }), 404);
      const { error } = await apiFetch('/api/order');
      expect(error?.[2]).toBe('data-not-found');
    });

    it('understands a plain envelope { error: "CODE", message, data }', async () => {
      respond(JSON.stringify({ error: 'RESOURCE_NOT_FOUND', message: 'Resource not found', data: { id: 7 } }), 404);
      const { error } = await apiFetch('/api/users');
      expect(error?.[1]).toBe(404);                       // HTTP status filled in
      expect(error?.[2]).toBe('RESOURCE_NOT_FOUND');
      expect(error?.[3]).toEqual({ id: 7 });
      expect(typeof error?.[0]).toBe('number');           // timestamp filled in
    });

    it('turns tuple field errors [code, path, value] into objects', async () => {
      respond(JSON.stringify([1, 422, 'VALIDATION', {}, [['NotBlank', 'name', '']]]), 422);
      const { error } = await apiFetch('/api/x');
      expect(error?.[4]).toEqual([{ code: 'NotBlank', path: 'name', value: '' }]);
    });

    it('an unrecognised JSON object is E_HTTP_ERROR', async () => {
      respond(JSON.stringify({ message: 'nope' }), 400);
      const { error } = await apiFetch('/api/x');
      expect(error?.[1]).toBe(400);
      expect(error?.[2]).toBe('E_HTTP_ERROR');
    });

    it('options.parseError replaces the built-in parser', async () => {
      respond(JSON.stringify({ type: 'about:blank', title: 'Not Found', status: 404 }), 404);
      const { error } = await apiFetch('/api/x', null, {
        parseError: (body, status) => {
          const b = body as { title?: string };
          return b.title ? [Date.now(), status, b.title.toUpperCase().replace(/ /g, '_'), {}] : null;
        },
      });
      expect(error?.[2]).toBe('NOT_FOUND');
    });

    it('options.parseError can delegate to parseApiError', async () => {
      respond(JSON.stringify(guard4j), 404);
      const { error } = await apiFetch('/api/x', null, { parseError: (b, s) => parseApiError(b, s) });
      expect(error?.[2]).toBe('DATA_NOT_FOUND');
    });

    it('a throwing parseError gives E_HTTP_ERROR', async () => {
      respond(JSON.stringify(guard4j), 500);
      const { error } = await apiFetch('/api/x', null, { parseError: () => { throw new Error('x'); } });
      expect(error?.[1]).toBe(500);
      expect(error?.[2]).toBe('E_HTTP_ERROR');
    });
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
