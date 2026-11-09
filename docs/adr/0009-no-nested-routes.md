---
status: accepted
date: 2026-03-08
---

# 0009. No nested routes: layouts come from framework composition

## Context and Problem Statement

Applications have shared layouts (header, navigation, footer) and nested areas. Many routers model this with nested route configs and outlet components.

## Considered Options

* A flat route table; layouts are components
* Nested route config with outlets

## Decision Outcome

Chosen option: **flat routes, layouts by composition**. Every route maps to one view; the view wraps itself in a layout component using the framework's own composition (Svelte snippets, Vue slots, React children).

### Consequences

* Good: no framework-specific router components; the router stays flat and small; layouts are explicit in the page.
* Bad: each page names its layout.
