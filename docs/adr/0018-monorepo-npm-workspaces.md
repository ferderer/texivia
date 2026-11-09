---
status: accepted
date: 2026-11-09
---

# 0018. Monorepo with npm workspaces

## Context and Problem Statement

The ecosystem has five packages plus example apps. The repository held only the router at its root.

## Considered Options

* npm workspaces at the root (`packages/*`, `examples/*`)
* Router at the root, other packages in a nested workspace
* pnpm workspaces

## Decision Outcome

Chosen option: **npm workspaces**. The root is a private package. Each package lives in `packages/texivia-<name>` with its own `package.json`, `vite.config.ts` (shared `vite.lib.ts`) and `tsconfig.json` (shared `tsconfig.base.json`). Internal dependencies use semver ranges (`^1.0.0`); npm links the local packages. The Svelte and Vue examples stay standalone projects with a `file:` dependency on the router.

### Consequences

* Good: one repository, one CI, one lockfile.
* Bad: npm has no `workspace:*` protocol; ranges must be kept in step (Changesets does this, ADR-0019).
* npm runs workspace scripts in `workspaces` order, not by dependency, so `texivia-reactive` is listed first.

### Options not chosen

* **Nested workspace** — Two build roots in one repository.
* **pnpm** — Would allow `workspace:*`, but means switching package manager, CI and lockfile.
