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
| non-2xx with an `ApiError` tuple as body | that tuple |
| any other non-2xx | error `E_HTTP_ERROR` |
| aborted via `signal` | error `E_ABORTED`, status `0` |
| network failure | error `E_NETWORK_ERROR`, status `500` |

The HTTP status is kept in `error[1]` for all HTTP responses. No retry, timeout or streaming.

ES module and CommonJS builds, each with type declarations. Apache-2.0.
