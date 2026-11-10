# texivia-fetch

A typed `fetch` wrapper that returns `{ payload, error }` instead of throwing. Zero dependencies, part of the [Texivia](https://github.com/ferderer/texivia) ecosystem.

```
npm install texivia-fetch
```

```ts
import { apiFetch } from 'texivia-fetch';

const { payload, error } = await apiFetch<User>('/api/me', null, {
  method: 'GET',
  signal,                       // optional AbortSignal
});

if (error) {
  if (error[2] === 'E_ABORTED') return;   // cancelled, not a failure
  showError(error[2]);
  return;
}
use(payload);
```

Defaults: `POST`, JSON body, `credentials: 'include'`. `ApiError` is the tuple `[timestamp, status, code, data, fields?]`.

| Response | Result |
|---|---|
| 2xx with JSON body | `{ payload, error: null }` |
| 2xx with empty body (e.g. 204) | `{ payload: null, error: null }` |
| 2xx with a body that is not JSON | error `E_INVALID_JSON` |
| non-2xx with a recognised error body (see below) | that error as `ApiError` |
| any other non-2xx | error `E_HTTP_ERROR` |
| aborted via `signal` | error `E_ABORTED`, status `0` |
| network failure | error `E_NETWORK_ERROR`, status `500` |

The HTTP status is kept in `error[1]` for all HTTP responses. No retry, timeout or streaming.

## Error formats

For a non-2xx response the JSON body is turned into an `ApiError` tuple. Three formats are recognised:

```jsonc
// 1. the tuple itself
[1700000000000, 404, "DATA_NOT_FOUND", { "id": "123" }]

// 2. Guard4j's response (code = error.name, or error.code if there is no name)
{ "timestamp": 1700000000000, "status": 404,
  "error": { "name": "DATA_NOT_FOUND", "code": "data-not-found", "message": "…" },
  "data": { "id": "123" },
  "fields": [{ "code": "NotBlank", "path": "email", "value": "" }] }   // validation errors, else null

// 3. a plain envelope
{ "error": "DATA_NOT_FOUND", "data": { "id": "123" } }
```

A missing timestamp becomes the current time, a missing status the HTTP status, missing data `{}`. Field errors always come out as `{ code, path, value }`; the tuple `[code, path, value]` is accepted as input. The `message` of an error body is not kept: render by `code`.

Anything else becomes `E_HTTP_ERROR`. To read another format, pass `parseError`; return `null` for "not an error body". Call `parseApiError` to keep the built-in formats:

```ts
import { apiFetch, parseApiError } from 'texivia-fetch';

const { error } = await apiFetch('/api/x', null, {
  parseError: (body, status) =>
    isProblemJson(body)                       // e.g. RFC 9457
      ? [Date.now(), status, body.type, { title: body.title }]
      : parseApiError(body, status),
});
```

ES module and CommonJS builds, each with type declarations. Apache-2.0.
