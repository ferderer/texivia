# Texivia

Ecosystem of small, atomic TypeScript packages for single-page apps. The core is `texivia-router` (published on npm): a framework-agnostic router that compiles all routes into one regex and reports matches through a DOM CustomEvent.

## Layout

npm workspaces monorepo (root package `texivia-ecosystem`, private):

- `packages/texivia-router` – router (published, 1.0.x). Builds `dist/texivia.{js,mjs}`; keep these names, they are part of the released package.
- `packages/texivia-reactive` – Proxy-based reactive state with `batch()`
- `packages/texivia-component` – component factory (template literals, `@event`, `@bind`, event delegation) → depends on reactive
- `packages/texivia-store` – global reactive store → depends on reactive
- `packages/texivia-fetch` – typed fetch wrapper `apiFetch<T>`
- `examples/vanilla-demo` – workspace member, uses router + component + fetch
- `examples/svelte/*`, `examples/vue/*` – standalone apps (own lockfile), depend on `file:…/packages/texivia-router`
- `benchmarks/router-benchmark` – matching-strategy benchmark (Node)
- `docs/` – static documentation page (`index.html`) and the README comparison image

Each package: `src/index.ts`, `tests/*.test.ts` (Vitest + jsdom), own `vite.config.ts` (lib build, Terser), `tsconfig.json` extending `../../tsconfig.base.json`.

## Commands (verified 2026-11-09, Node 24.22.1 / npm 11.19.1)

```bash
npm install                                   # all workspaces
npm run build                                 # all workspaces, in workspaces order
npm run build -w packages                     # packages only (used by the release workflow)
CI=1 npm test                                 # all test suites; needs a build first (see below)
npm test -w packages/texivia-router           # one package
npm run typecheck                             # tsc --noEmit per package
npm run dev                                   # vanilla-demo dev server
npx changeset                                 # describe a change for the next release
```

Framework examples: build the router first, then `cd examples/<fw>/<app> && npm ci && npm run build`.

- Build before testing: component and store tests import `texivia-reactive` from its `dist/`.
- `texivia-reactive` must stay first in the root `workspaces` array – npm runs workspace scripts in that order, not by dependency.
- Internal dependencies use semver ranges (`"texivia-reactive": "^1.0.0"`), never `workspace:*` (npm does not support it and would publish ranges literally).

Known failures (already present before the 2026-11 restructure, not yet fixed):

- `examples/vanilla-demo` build: TypeScript cast in `pages/RecipeDetail.js:40`
- `texivia-component`: 2 tests (`.prevent`, `.stop` modifiers); `texivia-fetch`: 1 test (`E_ABORTED` – `instanceof Error` fails for jsdom's DOMException)
- typecheck of component/store and `vue-tsc` in the Vue examples: no package emits `.d.ts` files
- `npm run lint` (router): `.eslintrc.js` is CommonJS inside a `"type": "module"` package
- `examples/svelte/micro/tests` has no runner configuration (no jsdom, no test script)

## Release

Changesets + npm trusted publishing (`.github/workflows/release.yml`). Merging the "Version Packages" PR publishes every package whose version is not on npm yet, with tags `<package>@<version>`. `ci.yml` builds and tests on Node 22.

## Router conventions

- API: `new Router<T>(routes)` with `ConfigRoute<T> = { path, view?, redirect?, handler? }`, plus `start()`, `stop()`, `navigate(path)`. No `back()`, no `.on()` callbacks, no global hooks, no `beforeEach`, no URLPattern, no nested route config.
- The router dispatches exactly one CustomEvent `texivia` on `document` with the readonly `MatchedRoute { path, view?, params, search, hash }` as detail. Only the app root listens; child components contain no routing logic.
- `HookType<T>` returns `boolean | string` (or a Promise of these): `false` aborts, a string redirects, `true` continues. Guards, auth and lazy loading live in handlers, not in router features. (Returning a view from a hook is planned but not implemented.)
- Matching: one master regex; each route contributes exactly one outer capture group, parameter segments are non-capturing (`\/(?:rx)`); the route is found by group position. A separate per-route `paramRegex` uses named groups; if it does not match, throw. Do not add partitioning, tries or per-route matchers.
- The wildcard `*` is always matched last, whatever its position in the config. `MAX_REDIRECTS = 10` (throws `Texivia: redirect limit exceeded`). Trailing slashes are not normalized.
- Redirects resolve via `new URL(redirect, window.location.origin)`. On an aborted popstate navigation, the URL is restored to `_currentUrl`.
- Link interception ignores modifier keys, non-left clicks, a target other than empty/`_self`, `download`, `no-router`, `rel="external"`, cross-origin and hash-only links.
- Layouts come from framework composition (Svelte: `<Layout>{#snippet body()}…{/snippet}</Layout>`), not from the router.
- The app creates the router singleton in its own module (e.g. `src/router.ts`).

## Other conventions

- Packages are unscoped and prefixed `texivia-`; one responsibility each; keep the dependency tree flat (component→reactive, store→reactive; planned: session→store, oidc→store+fetch).
- Fetch: `apiFetch<T>` returns `{ payload, error }`; `ApiError` is the tuple `[timestamp, status, code, data, fields?]`; an aborted request is `E_ABORTED` with status 0, distinct from `E_NETWORK_ERROR`; JSON, `credentials: 'include'`.
- Svelte examples: plain Svelte 5 without SvelteKit, runes only (`$props`, `$state`, `$derived` with a direct expression, `$effect`); rune stores in `.svelte.ts`; one component per file; navigate with native `<a>` links or `router.navigate()`, never `window.location.href`.
- Tests: Vitest with jsdom, one test file per router function; same-origin URLs for `pushState`; never spread `window.location` in mocks.
- Feature filter: add only what cannot easily be done with CSS/HTML/vanilla, is not rarely needed, and has no good small library.
