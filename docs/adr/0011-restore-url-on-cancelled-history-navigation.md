---
status: accepted
date: 2026-03-09
---

# 0011. A cancelled back/forward navigation restores the URL

## Context and Problem Statement

On back/forward the browser changes the URL before the router runs. If a handler then cancels the navigation, the address bar shows a URL whose view is not displayed.

## Considered Options

* Remember the last successful URL and push it back
* `history.go(-1)`

## Decision Outcome

Chosen option: **remember and push back**. The router keeps the full URL (path, query, hash) of the last successful navigation. When a handler cancels a `popstate` navigation, it pushes that URL again.

### Consequences

* Good: address bar and view stay in sync.
* The history gains one entry after a cancelled back/forward step.
