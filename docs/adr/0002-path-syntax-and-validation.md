---
status: accepted
date: 2026-03-09
---

# 0002. Path syntax `{name}` and `{name:regex}`; malformed paths throw

## Context and Problem Statement

Route paths are compiled into regexes. A typo in a path (missing brace, missing leading slash, a doubled slash, the same parameter twice) would otherwise produce a route that silently never matches or returns wrong parameters.

## Considered Options

* Strict syntax, validated in the constructor
* Lenient parsing, unmatched input passed through

## Decision Outcome

Chosen option: **strict syntax, validated in the constructor**. A path is a sequence of segments, each starting with `/`:

* a literal (`/users`), regex-escaped;
* `{name}`, matching one segment (`[^/]+`);
* `{name:regex}`, matching `regex` (it may span segments, e.g. `{path:.*}`);
* a single trailing `/`.

The constructor throws `Malformed path: …` if the segments do not add up to the path, `Malformed path (double slash): …` for `//`, and `Duplicate parameter name '…' in path: …` if a name repeats.

### Consequences

* Good: configuration errors show up at startup, not as a mysterious 404.
* Bad: no optional segments or other syntax sugar; use two routes or a regex constraint.
