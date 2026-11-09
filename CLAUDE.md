# Texivia

Ecosystem of small, atomic TypeScript packages for single-page apps. The core is `texivia-router` (published on npm): a framework-agnostic router that compiles all routes into one regex and reports matches through a DOM CustomEvent.

## Layout

npm workspaces monorepo (root package `texivia-ecosystem`, private):

- `packages/texivia-router` – router (published, 1.0.x). Builds `dist/texivia.{mjs,cjs}`; keep the base name `texivia`, it is part of the released package. CommonJS output must end in `.cjs` (all packages are `"type": "module"`).
- `packages/texivia-reactive` – Proxy-based reactive state with `batch()`
- `packages/texivia-component` – component factory (template literals, `@event`, `@bind`, event delegation) → depends on reactive
- `packages/texivia-store` – global reactive store → depends on reactive
- `packages/texivia-fetch` – typed fetch wrapper `apiFetch<T>`
- `examples/vanilla-demo` – workspace member, uses router + component + fetch
- `examples/svelte/*`, `examples/vue/*` – standalone apps (own lockfile), depend on `file:…/packages/texivia-router`
- `benchmarks/router-benchmark` – matching-strategy benchmark (Node)
- `docs/` – the README comparison image. The documentation page lives on the website (https://ferderer.de/projects/texivia, also `homepage` in the router package.json), not in this repo.

Each package: `src/index.ts`, `tests/*.test.ts` (Vitest + jsdom), `vite.config.ts` calling the shared `libConfig()` from `../../vite.lib.ts` (lib build, Terser, dependencies external), `tsconfig.json` extending `../../tsconfig.base.json`. `npm run build` = `vite build && tsc --emitDeclarationOnly && node ../../scripts/cts-types.mjs` (→ `dist/index.d.ts` for `import`, `dist/index.d.cts` for `require`; `exports` maps each condition to its own `types`). Relative imports in package sources use `.js` extensions (needed in the emitted ESM declarations).

## Commands (verified 2026-11-09, Node 24.22.1 / npm 11.19.1)

```bash
npm install                                   # all workspaces
npm run build                                 # all workspaces, in workspaces order
npm run build -w packages                     # packages only (used by the release workflow)
CI=1 npm test                                 # all test suites; needs a build first (see below)
npm test -w packages/texivia-router           # one package
npm run typecheck                             # tsc --noEmit per package
npm run lint                                  # ESLint (router)
npm run dev                                   # vanilla-demo dev server
npx changeset                                 # describe a change for the next release
```

Framework examples: build the router first, then `cd examples/<fw>/<app> && npm ci && npm run build`; `examples/svelte/micro` also has `npm test` (runs against the router source).

- Build before testing: component and store tests import `texivia-reactive` from its `dist/` (types too).
- `texivia-reactive` must stay first in the root `workspaces` array – npm runs workspace scripts in that order, not by dependency.
- Internal dependencies use semver ranges (`"texivia-reactive": "^1.0.0"`), never `workspace:*` (npm does not support it and would publish ranges literally).

All suites pass (2026-11-09).

## Release

Changesets + npm trusted publishing (`.github/workflows/release.yml`). Merging the "Version Packages" PR publishes every package whose version is not on npm yet, with tags `<package>@<version>`. `ci.yml` builds and tests on Node 22.

## Router conventions

- API: `new Router<T>(routes)` with `ConfigRoute<T> = { path, view?, redirect?, handler? }`, plus `start()`, `stop()`, `navigate(path)`. No `back()`, no `.on()` callbacks, no global hooks, no `beforeEach`, no URLPattern, no nested route config.
- The router dispatches exactly one CustomEvent `texivia` on `document` with the readonly `MatchedRoute { path, view?, params, search, hash }` as detail. Only the app root listens; child components contain no routing logic.
- `HookType<T>` returns `boolean | string | T | void` (or a Promise of these): `false` aborts, a string redirects (also when T is string), `true`/nothing continues, a view `T` replaces the route's view while the URL stays the requested one. Guards, auth and lazy loading live in handlers, not in router features (see the README "Patterns").
- Matching: one master regex; each route contributes exactly one outer capture group, parameter segments are non-capturing (`\/(?:rx)`); the route is found by group position. A separate per-route `paramRegex` uses named groups; if it does not match, throw. Do not add partitioning, tries or per-route matchers.
- Matching is case-insensitive, for the master regex and the per-route `paramRegex` alike (parameter values keep their case).
- The wildcard `*` is always matched last, whatever its position in the config. The constructor throws on malformed paths, `//` and duplicate parameter names. `MAX_REDIRECTS = 10` (throws `Texivia: redirect limit exceeded`). Trailing slashes are not normalized.
- Redirects resolve via `new URL(redirect, window.location.origin)`. `_currentUrl` is updated after every successful navigation; on an aborted popstate navigation, the URL is restored to it.
- Link interception ignores modifier keys, non-left clicks, a target other than empty/`_self`, `download`, `no-router`, `rel="external"`, cross-origin and hash-only links.
- Layouts come from framework composition (Svelte: `<Layout>{#snippet body()}…{/snippet}</Layout>`), not from the router.
- The app creates the router singleton in its own module (e.g. `src/router.ts`).

## Other conventions

- Packages are unscoped and prefixed `texivia-`; one responsibility each; keep the dependency tree flat (component→reactive, store→reactive; planned: session→store, oidc→store+fetch). Never bundle another package: `libConfig()` marks dependencies as external.
- Members starting with `_` are renamed by Terser in `dist/` (property mangling); tests that use private members must run against `src/`.
- texivia-component delegates events on `document` in the capture phase (`.stop` stops all later listeners; focus/blur work). Every directive becomes its own attribute `data-eid-<n>` (unique names, so directives on one element never collide and no tag parsing is needed to merge them); each handler is registered for one event type, and a listener runs all handlers for that type on the nearest element that has any, in template order (`@bind` before a later `@change`). `@bind` writes back on `input` (text, textarea) or `change` (checkbox, radio, select) and HTML-escapes the injected value; values the template interpolates itself are not escaped.
- A re-render replaces the whole container (`innerHTML`). `@bind` write-backs therefore set state without re-rendering (focus and cursor stay); other parts of the template show the bound value only after the next render caused by another state change. Do not render live previews of bound fields.
- `batch()` (texivia-reactive) collects the notify function of every reactive object changed inside it and calls each once; the second parameter is ignored.
- Fetch: `apiFetch<T>` returns `{ payload, error }`; `ApiError` is the tuple `[timestamp, status, code, data, fields?]`; the body is read as text: empty → `payload: null` (204), 2xx non-JSON → `E_INVALID_JSON`, non-2xx → the server's ApiError tuple if the body is one, else `E_HTTP_ERROR`, always with the HTTP status; an aborted request is `E_ABORTED` with status 0, distinct from `E_NETWORK_ERROR` (detected by `err.name === 'AbortError'`, no `instanceof` – DOMException may come from another realm); JSON, `credentials: 'include'`.
- Svelte examples: plain Svelte 5 without SvelteKit, runes only (`$props`, `$state`, `$derived` with a direct expression, `$effect`); rune stores in `.svelte.ts`; one component per file; navigate with native `<a>` links or `router.navigate()`, never `window.location.href`.
- Tests: Vitest with jsdom, one test file per router function; same-origin URLs for `pushState`; never spread `window.location` in mocks.
- Feature filter: add only what cannot easily be done with CSS/HTML/vanilla, is not rarely needed, and has no good small library.
