---
status: accepted
date: 2026-05-06
---

# 0006. Route handlers are the only hook: continue, cancel, redirect or render a view

## Context and Problem Statement

Applications need guards (authentication), data preloading, lazy loading and role-dependent pages. Routers usually add features for each: global `beforeEach`/`afterEach`, guard APIs, lazy-loading options, navigation context objects.

## Considered Options

* One optional `handler` per route
* Global hooks (`beforeEach`, `afterEach`) and a navigation context
* Dedicated options such as `lazyLoad`

## Decision Outcome

Chosen option: **one handler per route**. `handler(match)` runs before the navigation completes, may be async, and returns:

* `true` or nothing — continue;
* `false` — cancel;
* a string — redirect to that path (always, also when views are strings);
* a view `T` — render it instead of the route's `view`; the URL stays the requested one.

Lazy loading, retries, loading states, locale prefixes and OAuth2 flows are documented as patterns built on handlers (router README, "Patterns"), not as router features.

### Consequences

* Good: one concept covers guards, preloading, lazy loading and view switching (e.g. `/` renders an admin or member dashboard without extra routes or redirects).
* Bad: a guard that applies to many routes is attached to each of them (or the handler is shared).

### Options not chosen

* **Global hooks / context** — More API surface; the per-route handler already covers the cases.
* **`lazyLoad` option** — Pulls loading, error handling and retry into the router and invites follow-up features.
