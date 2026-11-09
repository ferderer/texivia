---
"texivia-router": minor
---

- Handlers may return a view: it replaces the route's `view` while the URL stays the requested one. Strings are still redirects.
- Type declarations are shipped (`dist/index.d.ts`).
- Parameterized routes match case-insensitively like static routes (`/USERS/5` threw `param regex mismatch`); parameter constraints are case-insensitive too.
- The constructor rejects double slashes and duplicate parameter names with explicit errors.
- A cancelled back/forward navigation restores the last successful URL, also when that route has no handler.
- Size 1.5 kB (min+gzip).
