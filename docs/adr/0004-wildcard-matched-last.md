---
status: accepted
date: 2026-03-09
---

# 0004. The wildcard `*` is always matched last

## Context and Problem Statement

Routes are matched in config order. A catch-all route `*` placed before other routes would make every following route unreachable.

## Considered Options

* Move the wildcard to the end internally
* Throw if the wildcard is not last
* Keep config order

## Decision Outcome

Chosen option: **move it to the end**. While compiling the config in a single loop, the constructor sets the `*` route aside and appends it after all others. It is the only special path.

### Consequences

* Good: no ordering trap and no startup error.
* The position of `*` in the config has no meaning; the documentation says so.
