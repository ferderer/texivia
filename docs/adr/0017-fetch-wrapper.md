---
status: accepted
date: 2026-11-09
---

# 0017. `apiFetch`: `{ payload, error }` with an ApiError tuple

## Context and Problem Statement

Data fetching needs a consistent error shape, cancellation when the user navigates away, and a way to tell cancellation apart from failure. Libraries such as ky, wretch or ofetch solve this with their own API.

## Considered Options

* A small `apiFetch<T>` returning `{ payload, error }`
* An existing library
* Throwing on errors

## Decision Outcome

Chosen option: **`apiFetch<T>(endpoint, data?, { method?, signal?, headers? })`**, returning `{ payload: T | null, error: ApiError | null }`. `ApiError` is the tuple `[timestamp, status, code, data, fields?]`, a compact error envelope a server can send directly. Defaults: `POST`, JSON body, `credentials: 'include'`.

| Response | Result |
|---|---|
| 2xx with JSON | `payload` |
| 2xx with empty body (e.g. 204) | `payload: null`, `error: null` |
| 2xx, body not JSON | `E_INVALID_JSON` |
| non-2xx with an ApiError body | that tuple |
| other non-2xx | `E_HTTP_ERROR` |
| aborted via `signal` | `E_ABORTED`, status 0 |
| network failure | `E_NETWORK_ERROR`, status 500 |

HTTP responses keep their status. Components pass `ctx.signal` (aborted on unmount) to cancel requests on navigation.

### Consequences

* Good: the return type forces callers to handle both outcomes; cancellation is not shown as an error.
* Bad: `POST` by default is unusual; read endpoints set `method: 'GET'`.
* Bad: servers with another error format get `E_HTTP_ERROR` without details.
* No retry, timeout or streaming.

### Options not chosen

* **Library** — Another dependency and API for a narrow problem.
* **Throwing** — Easy to forget the `try/catch`.
