---
status: accepted
date: 2026-03-09
---

# 0012. No trailing-slash normalization

## Context and Problem Statement

`/users` and `/users/` are different paths. Some routers treat them as the same.

## Considered Options

* Match paths exactly
* An option such as `trailingSlash: 'ignore'`

## Decision Outcome

Chosen option: **exact matching**. If both forms should work, define two routes (one may redirect to the other).

### Consequences

* Good: no options parameter.
* Bad: both forms need explicit routes.
