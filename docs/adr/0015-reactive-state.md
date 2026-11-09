---
status: accepted
date: 2026-11-09
---

# 0015. Reactive state: a shallow Proxy with `batch()`

## Context and Problem Statement

Components and the store need to re-render when state changes, without a compiler, a virtual DOM or explicit subscriptions.

## Considered Options

* Shallow Proxy with a notify callback and `batch()`
* Signals with dependency tracking
* Explicit `emit('change')`

## Decision Outcome

Chosen option: **`reactive(obj, notify)`**, a shallow Proxy that calls `notify()` on every write that changes a value (writing the same value does nothing). Nested objects are not observed.

`batch(fn)` suppresses notifications while `fn` runs, then calls the notify function of every reactive object that changed, once each – also across objects, e.g. component state and the global store in one batch. Nested batches defer to the outermost one. It uses module-level state, no scheduler or microtask.

### Consequences

* Good: plain property assignment; under 30 lines of code; synchronous and easy to debug.
* Bad: no deep observation and no computed values; derive values in the template.

### Options not chosen

* **Signals** — Finer updates, but needs a dependency graph; much more code.
* **Explicit emit** — Worse ergonomics than assignment.
