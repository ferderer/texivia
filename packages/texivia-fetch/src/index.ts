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

/**
 * Fetches the given endpoint and returns a discriminated ApiResponse<T>.
 * The caller is forced to handle both payload and error — no uncaught exceptions.
 *
 * Defaults: POST, credentials: 'include', Content-Type: application/json.
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

    if (!response.ok) {
      const err = await response.json() as ApiError;
      return { payload: null, error: err };
    }

    const payload = await response.json() as T;
    return { payload, error: null };
  }
  catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError')
      return { payload: null, error: [Date.now(), 0, 'E_ABORTED', {}] };

    return { payload: null, error: [Date.now(), 500, 'E_NETWORK_ERROR', {}] };
  }
}
