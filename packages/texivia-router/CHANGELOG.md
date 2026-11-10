# texivia-router

## 1.1.0

### Minor Changes

- d272222: - Handlers may return a view: it replaces the route's `view` while the URL stays the requested one. Strings are still redirects.
  - Type declarations are shipped: `dist/index.d.ts` for `import`, `dist/index.d.cts` for `require` (TypeScript `module: node16/nodenext` resolves the right one).
  - `require('texivia-router')` works: the CommonJS build is now `dist/texivia.cjs`. In 1.0.0 it was `dist/texivia.js`, which Node loads as an ES module because the package has `"type": "module"`, so it failed with `exports is not defined`.
  - Parameterized routes match case-insensitively like static routes (`/USERS/5` threw `param regex mismatch`); parameter constraints are case-insensitive too.
  - The constructor rejects double slashes and duplicate parameter names with explicit errors.
  - A cancelled back/forward navigation restores the last successful URL, also when that route has no handler.

### Patch Changes

- 127fed5: Repository moved to a multi-package layout (`packages/texivia-router`). The ES module keeps its name (`dist/texivia.mjs`).
