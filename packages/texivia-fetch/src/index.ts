/**
 * texivia-fetch
 *
 * Typed fetch wrapper with structured error handling and AbortSignal support.
 * Zero dependencies.
 */

export type ValidationError = {
  field:   string;
  code:    string;
  message: string;
};

/**
 * Tuple format: [timestamp, httpStatus, errorCode, data, validationErrors?]
 * Compact, serialisable, maps directly to server error envelopes.
 */
export type ApiError = [
  timestamp: string | number,
  status:    number,
  code:      string,
  data:      Record<string, unknown>,
  fields?:   ValidationError[],
];

export type ApiResponse<T> = {
  payload: T | null;
  error:   ApiError | null;
};

export type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

function isApiError(body: unknown): body is ApiError {
  return Array.isArray(body) && body.length >= 4
    && typeof body[1] === 'number' && typeof body[2] === 'string';
}

/**
 * Fetches the given endpoint and returns a discriminated ApiResponse<T>.
 * The caller is forced to handle both payload and error — no uncaught exceptions.
 *
 * Defaults: POST, credentials: 'include', Content-Type: application/json.
 *
 * Outcomes:
 * - 2xx with JSON body → payload; 2xx with empty body (e.g. 204) → payload null, error null
 * - 2xx with a body that is not JSON → error E_INVALID_JSON (HTTP status kept)
 * - non-2xx with an ApiError tuple as body → that tuple
 * - non-2xx otherwise → error E_HTTP_ERROR (HTTP status kept)
 * - aborted → E_ABORTED (status 0); network failure → E_NETWORK_ERROR (status 500)
 *
 * @example
 * const { payload, error } = await apiFetch<User>('/api/me')
 * if (error) { ... } else { use(payload) }
 */
export async function apiFetch<T>(
  endpoint: string,
  data:     unknown = null,
  options:  FetchOptions = {},
): Promise<ApiResponse<T>> {
  const method = options.method ?? 'POST';
  const isGet  = method === 'GET';

  try {
    const response = await fetch(endpoint, {
      method,
      credentials: 'include',
      signal:  options.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: isGet ? undefined : JSON.stringify(data),
    });

    const text = await response.text();
    let body: unknown = null;
    if (text) {
      try {
        body = JSON.parse(text);
      }
      catch {
        if (response.ok)
          return { payload: null, error: [Date.now(), response.status, 'E_INVALID_JSON', {}] };
      }
    }

    if (!response.ok)
      return { payload: null, error: isApiError(body) ? body : [Date.now(), response.status, 'E_HTTP_ERROR', {}] };

    return { payload: body as T, error: null };
  }
  catch (err: unknown) {
    if ((err as { name?: unknown } | null)?.name === 'AbortError')
      return { payload: null, error: [Date.now(), 0, 'E_ABORTED', {}] };

    return { payload: null, error: [Date.now(), 500, 'E_NETWORK_ERROR', {}] };
  }
}
