---
status: accepted
date: 2026-03-09
---

# 0005. Routes are a config array; matches are reported as one `texivia` event

## Context and Problem Statement

The router has to tell the application which view to show. Many routers do this with framework components (`<RouterView>`, `<Outlet>`) or callbacks (`router.on('/path', fn)`), which ties the router to a framework or to the renderer.

## Considered Options

* Config array in the constructor, one CustomEvent per navigation
* `router.on(path, callback)` registration
* Framework-specific outlet components
* Each component reads `popstate` itself

## Decision Outcome

Chosen option: **config array plus one DOM event**. `new Router<T>(routes)` takes all routes as `{ path, view?, redirect?, handler? }`. The view is an explicit property of type `T` (a component, a function, a string – whatever the app renders), not mixed into the route object. After each successful navigation the router dispatches one `CustomEvent('texivia')` on `document` with the readonly `MatchedRoute { path, view?, params, search, hash }` as `detail`. Only the app root listens and renders; components below it contain no routing code.

The app creates the router instance in its own module (e.g. `src/router.ts`) and imports it where it needs `navigate()`.

### Consequences

* Good: works with any framework or none; the router can be tested without a UI.
* Good: the route table is visible in one place, in a defined order.
* Bad: the app root needs a few lines of glue (listen, store view and params, render).

### Options not chosen

* **Callbacks** — The router module would need a reference to the renderer.
* **Outlet components** — One adapter per framework.
* **`popstate` in components** — Duplicates routing logic in every component.
