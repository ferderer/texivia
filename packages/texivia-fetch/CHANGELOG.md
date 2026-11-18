# texivia-fetch

## 1.1.0

### Minor Changes

- cc06a27: - Error bodies of non-2xx responses: besides the tuple, `apiFetch` now understands Guard4j's response object (`{ timestamp, status, error: { name, code, … }, data, fields }`, code = `error.name`) and a plain `{ error: 'CODE', data? }`. Missing timestamp, status and data are filled in. Before, only the tuple was recognised and everything else became `E_HTTP_ERROR`.
  - New option `parseError(body, status)` for other formats, and the exported `parseApiError`.
  - `ValidationError` is now `{ code, path, value }` (Guard4j's field error); it was `{ field, code, message }`, which no server sent. Tuple field errors `[code, path, value]` are converted to objects.

## 1.0.1

### Patch Changes

- c17e34f: Add a README and the Apache-2.0 LICENSE file to the published package (1.0.0 contained only `dist/` and `package.json`).
