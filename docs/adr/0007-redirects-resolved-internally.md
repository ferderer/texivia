---
status: accepted
date: 2026-03-09
---

# 0007. Redirects are resolved internally and limited to 10

## Context and Problem Statement

Routes can redirect (`redirect: '/new'`) and handlers can return a redirect path. Redirect targets may be relative or absolute, and redirects can form a loop.

## Considered Options

* Resolve every target with `new URL(target, origin)`; limit the chain
* Own logic for absolute vs. relative targets; no limit

## Decision Outcome

Chosen option: **`new URL(target, window.location.origin)` and a limit of 10**. Redirects are followed inside the router, without a history entry for the intermediate URLs. After more than 10 redirects in a row, navigation throws `Texivia: redirect limit exceeded`.

### Consequences

* Good: no special cases; loops fail loudly instead of overflowing the stack.
* External URLs are not the router's business: link to them with a normal `<a>`.
