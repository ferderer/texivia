---
status: accepted
date: 2026-11-09
---

# 0016. Components: template strings, full re-render, event delegation, `@bind` without re-render

## Context and Problem Statement

`texivia-component` needs a rendering strategy, an event model and form binding, without a compiler, a virtual DOM or a build step beyond the bundler.

## Considered Options

* Template strings, full `innerHTML` re-render, global event delegation
* Virtual DOM diffing
* lit-html style template parts
* Per-element listeners attached after each render
* Native `on*` attributes

## Decision Outcome

Chosen option: **template strings with delegation**.

* **Rendering:** a component's `template(state & props)` returns an HTML string; every state change re-renders the whole container via `innerHTML`.
* **Events:** templates use `@event[.prevent|.stop|.once]="method"`. Each directive becomes its own attribute `data-eid-<n>` pointing to a handler for one event type. One capture-phase listener per event type on `document` finds the nearest element (target or ancestor) with handlers for that type and runs them in template order. Handlers are scoped per component and dropped on re-render and unmount.
* **Binding:** `@bind="key"` injects the current value (`value`, `checked`, selected `<option>`, textarea text), HTML-escaped, and writes changes back on `input` (text, textarea) or `change` (checkbox, radio, select). **The write-back does not re-render**: the element already shows the value, and a re-render would replace the focused field and lose focus and cursor. Other parts of the template show the bound value after the next render caused by another state change.

### Consequences

* Good: no compiler, no dependencies besides `texivia-reactive`; small and predictable.
* Good: `@bind` and `@change` (or `@input`) on one element both run, binding first.
* Bad: ephemeral DOM state (scroll position, open `<details>`) is lost on every re-render.
* Bad: no live previews of bound fields; render them from a method instead (e.g. on `@change`).
* Values interpolated by the template itself (`${…}`) are inserted as HTML; escape untrusted data there.
* `@`-directives are not valid HTML; linters need configuration.

### Options not chosen

* **Virtual DOM** — Keeps DOM state, but a large amount of code.
* **lit-html** — Partial updates, but a dependency or a reimplementation; use lit-html directly if needed.
* **Per-element listeners** — Needs manual cleanup after every render.
* **`on*` attributes** — Resolving handler names needs `eval`/`Function()`.
