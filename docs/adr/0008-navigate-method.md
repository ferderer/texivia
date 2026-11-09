---
status: accepted
date: 2026-03-08
---

# 0008. Programmatic navigation via `navigate(path)`

## Context and Problem Statement

Code outside of links (after a form submit, in a guard, in a service) needs to navigate. Before 1.0, this worked only by dispatching a `texivia.goto` event.

## Considered Options

* A public `navigate(path)` method
* Navigation by dispatching an event

## Decision Outcome

Chosen option: **`navigate(path): Promise<MatchedRoute<T> | null>`**. It accepts a path with query and hash, runs the same steps as a link click and returns the matched route, or `null` if nothing matched or a handler cancelled. There is no navigation event and no `back()` (use `history.back()`).

### Consequences

* Good: one way to navigate; typed; awaitable.
* Code that navigates imports the app's router instance.
