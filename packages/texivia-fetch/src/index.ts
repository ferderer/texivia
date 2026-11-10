/**
 * texivia-fetch
 *
 * Typed fetch wrapper with structured error handling and AbortSignal support.
 * Zero dependencies.
 */

/** One invalid field of a validation error (same shape as Guard4j's `FieldError`). */
export type ValidationError = {
  code:  string;
  path:  string;
  value: unknown;
};

/**
 * Tuple format: [timestamp, httpStatus, errorCode, data, validationErrors?]
 * Compact and serialisable. The five elements are, in order, the fields of
 * Guard4j's error response (`timestamp, status, error, data, fields`); the
 * code is the error's stable name (e.g. `DATA_NOT_FOUND`).
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
  /**
   * Turns the JSON body of a non-2xx response into an ApiError; return null if the
   * body is not an error envelope (the result is then E_HTTP_ERROR). Replaces
   * {@link parseApiError}; call it yourself to keep the built-in formats.
   */
  parseError?: (body: unknown, status: number) => ApiError | null;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** A field error as object `{ code, path, value }` or as tuple `[code, path, value]`. */
function toField(v: unknown): ValidationError | null {
  if (Array.isArray(v) && typeof v[0] === 'string' && typeof v[1] === 'string')
    return { code: v[0], path: v[1], value: v[2] };
  if (isRecord(v) && typeof v.code === 'string' && typeof v.path === 'string')
    return { code: v.code, path: v.path, value: v.value };
  return null;
}

/**
 * Built-in error parser. Understands, for the body of a non-2xx response:
 * - the ApiError tuple `[timestamp, status, code, data, fields?]`
 * - Guard4j's response `{ timestamp, status, error: { name, code, … }, data, fields }`
 *   (code = `error.name`, or `error.code` if there is no name)
 * - a plain envelope `{ error: 'CODE', data? }` (`error` is the code string)
 * Missing timestamp and status are filled in (now, HTTP status), missing data is `{}`.
 * Returns null for anything else.
 */
export function parseApiError(body: unknown, status: number): ApiError | null {
  if (Array.isArray(body)) {
    if (body.length < 4 || typeof body[1] !== 'number' || typeof body[2] !== 'string') return null;
    const fields = Array.isArray(body[4]) ? body[4].map(toField).filter((f): f is ValidationError => f !== null) : [];
    return fields.length
      ? [body[0], body[1], body[2], body[3], fields]
      : [body[0], body[1], body[2], body[3]];
  }
  if (!isRecord(body)) return null;

  const e = body.error;
  const code = typeof e === 'string' ? e
    : isRecord(e) ? (typeof e.name === 'string' ? e.name : typeof e.code === 'string' ? e.code : null)
    : null;
  if (!code) return null;

  const timestamp = typeof body.timestamp === 'number' || typeof body.timestamp === 'string'
    ? body.timestamp : Date.now();
  const httpStatus = typeof body.status === 'number' ? body.status : status;
  const data = isRecord(body.data) ? body.data : {};
  const fields = Array.isArray(body.fields)
    ? body.fields.map(toField).filter((f): f is ValidationError => f !== null)
    : undefined;

  return fields?.length ? [timestamp, httpStatus, code, data, fields] : [timestamp, httpStatus, code, data];
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
 * - non-2xx with a recognised error body (see parseApiError, or options.parseError) → that error
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

    if (!response.ok) {
      let error: ApiError | null = null;
      try { error = (options.parseError ?? parseApiError)(body, response.status); }
      catch { /* a failing parser means: not a recognised error body */ }
      return { payload: null, error: error ?? [Date.now(), response.status, 'E_HTTP_ERROR', {}] };
    }

    return { payload: body as T, error: null };
  }
  catch (err: unknown) {
    if ((err as { name?: unknown } | null)?.name === 'AbortError')
      return { payload: null, error: [Date.now(), 0, 'E_ABORTED', {}] };

    return { payload: null, error: [Date.now(), 500, 'E_NETWORK_ERROR', {}] };
  }
}
