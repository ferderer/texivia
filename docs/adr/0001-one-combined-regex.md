---
status: accepted
date: 2026-03-09
---

# 0001. One combined regex; the route is found by capture-group position

## Context and Problem Statement

A router has to find the route for a URL. Common approaches are a loop over one matcher per route, a trie, or partitioning the routes by their first segment. Texivia aims to be as small as possible while staying correct for the route counts of real SPAs (tens of routes, rarely more than 100).

## Considered Options

* One combined regex for all routes
* A loop over one regex (or `URLPattern`) per route
* A trie
* Partitioning by the first path segment

## Decision Outcome

Chosen option: **one combined regex**. The constructor compiles every route path into one alternative of a master regex. Each route contributes exactly one outer capture group; parameter segments inside it are non-capturing (`\/(?:rx)`), so custom parameter regexes cannot shift the group numbering. After one `exec()`, the index of the first defined group identifies the route. A second, per-route regex with named groups (`(?<id>…)`) then extracts the parameters.

The first matching route in config order wins (the wildcard `*` is the exception, see ADR-0004).

### Consequences

* Good: about a dozen lines of matching code; no data structure to maintain.
* Good: one `exec()` per navigation; no loop over routes in JavaScript.
* Bad: the cost per match grows with the number of routes. `exec()` allocates a result array with one entry per route, so a match costs about 0.3 µs with 10 routes, 0.6 µs with 100 and 6 µs with 1,000 (static routes, Node; for a non-match the regex engine returns early and no array is built). A trie is flat (0.3–0.7 µs) but needs about 100 more lines. For the route counts of the target (dozens) the difference is far below what a navigation costs anywhere else, so it does not matter; an app with hundreds of routes is no longer the small SPA Texivia is for.
* The per-route parameter regex must match whenever the master regex selected the route. If it does not, that is a bug in the router, and it throws instead of returning "no match".

### Options not chosen

* **Loop over per-route matchers / `URLPattern`** — More code; `URLPattern` also lacks support in some browsers.
* **Trie** — Fastest, but much more code for no practical gain at SPA route counts.
* **Partitioning by first segment** — +50–80 lines and edge cases (dynamic first segments, wildcard) for no measurable benefit with 10–100 routes.
* **Static routes in a `Map`, only dynamic ones in the regex** — Saves little: with 60 routes, 15 of them static, 45 capture groups remain. It would also change which route wins when a dynamic route is defined before a static one.
