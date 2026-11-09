# Architecture Decision Records

Why Texivia is built the way it is. Format: [MADR](https://adr.github.io/madr/). All decisions are accepted and describe the current code.

| # | Decision | Date |
|---|---|---|
| 0001 | [One combined regex; the route is found by capture-group position](./0001-one-combined-regex.md) | 2026-03-09 |
| 0002 | [Path syntax `{name}` and `{name:regex}`; malformed paths throw](./0002-path-syntax-and-validation.md) | 2026-03-09 |
| 0003 | [Case-insensitive matching, parameter constraints included](./0003-case-insensitive-matching.md) | 2026-11-09 |
| 0004 | [The wildcard `*` is always matched last](./0004-wildcard-matched-last.md) | 2026-03-09 |
| 0005 | [Routes are a config array; matches are reported as one `texivia` event](./0005-routes-as-config-and-one-dom-event.md) | 2026-03-09 |
| 0006 | [Route handlers are the only hook: continue, cancel, redirect or render a view](./0006-route-handlers-are-the-only-hook.md) | 2026-05-06 |
| 0007 | [Redirects are resolved internally and limited to 10](./0007-redirects-resolved-internally.md) | 2026-03-09 |
| 0008 | [Programmatic navigation via `navigate(path)`](./0008-navigate-method.md) | 2026-03-08 |
| 0009 | [No nested routes: layouts come from framework composition](./0009-no-nested-routes.md) | 2026-03-08 |
| 0010 | [Which link clicks the router handles](./0010-link-interception.md) | 2026-03-09 |
| 0011 | [A cancelled back/forward navigation restores the URL](./0011-restore-url-on-cancelled-history-navigation.md) | 2026-03-09 |
| 0012 | [No trailing-slash normalization](./0012-no-trailing-slash-normalization.md) | 2026-03-09 |
| 0013 | [Atomic packages instead of a framework; dependencies declared, never bundled](./0013-atomic-packages.md) | 2026-03-15 |
| 0014 | [Feature filter: only what the platform or a small library does not already solve](./0014-feature-filter.md) | 2026-03-15 |
| 0015 | [Reactive state: a shallow Proxy with `batch()`](./0015-reactive-state.md) | 2026-11-09 |
| 0016 | [Components: template strings, full re-render, event delegation, `@bind` without re-render](./0016-component-model.md) | 2026-11-09 |
| 0017 | [`apiFetch`: `{ payload, error }` with an ApiError tuple](./0017-fetch-wrapper.md) | 2026-11-09 |
| 0018 | [Monorepo with npm workspaces](./0018-monorepo-npm-workspaces.md) | 2026-11-09 |
| 0019 | [Releases via Changesets and npm trusted publishing](./0019-changesets-and-trusted-publishing.md) | 2026-11-09 |
| 0020 | [Build output: ES and CommonJS with separate types; private members are mangled](./0020-build-output.md) | 2026-11-09 |
