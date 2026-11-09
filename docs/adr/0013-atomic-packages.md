---
status: accepted
date: 2026-03-15
---

# 0013. Atomic packages instead of a framework; dependencies declared, never bundled

## Context and Problem Statement

Beyond routing, apps need reactive state, components, a global store and data fetching. These could live in one framework package with a shared core.

## Considered Options

* Independent packages with one job each
* One framework package with a `core/`
* Independent packages that each bundle their own helpers

## Decision Outcome

Chosen option: **independent packages**: `texivia-router`, `texivia-reactive`, `texivia-component`, `texivia-store`, `texivia-fetch`. Each is versioned and usable on its own. "Atomic" means one responsibility, not zero coordination: packages may depend on each other through declared semver dependencies, and the tree stays flat (component → reactive, store → reactive). A package never bundles another one; the build marks all dependencies as external, so an app has exactly one copy of each.

### Consequences

* Good: apps install only what they use (e.g. router + fetch).
* Bad: more packages to version and publish (see ADR-0019).

### Options not chosen

* **Framework with core** — Users load parts they do not need.
* **Bundled helpers** — Duplicate code and, for state, duplicate module state in one app.
