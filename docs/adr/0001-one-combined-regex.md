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
* Bad: not faster than the alternatives. A benchmark (`benchmarks/router-benchmark`) shows the regex engine still tries the alternatives one after another: a trie is faster for matches, the combined regex is fastest for non-matches (404). With 1,000 routes the worst case is below 1 ms, so for SPAs the difference does not matter; simplicity does.
* The per-route parameter regex must match whenever the master regex selected the route. If it does not, that is a bug in the router, and it throws instead of returning "no match".

### Options not chosen

* **Loop over per-route matchers / `URLPattern`** — More code; `URLPattern` also lacks support in some browsers.
* **Trie** — Fastest, but much more code for no practical gain at SPA route counts.
* **Partitioning by first segment** — +50–80 lines and edge cases (dynamic first segments, wildcard) for no measurable benefit with 10–100 routes.
