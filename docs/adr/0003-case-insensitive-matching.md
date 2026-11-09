---
status: accepted
date: 2026-11-09
---

# 0003. Case-insensitive matching, parameter constraints included

## Context and Problem Statement

URLs are typed by hand, shared and linked with varying case. Texivia 1.0.0 matched static routes case-insensitively, but the parameter regex was case-sensitive, so `/USERS/5` selected `/users/{id}` and then failed.

## Considered Options

* Case-insensitive for routes and parameter constraints
* Case-sensitive everywhere
* A router option

## Decision Outcome

Chosen option: **case-insensitive everywhere**. Both the combined regex and the per-route parameter regex use the flag `i`. Parameter values keep the case of the URL.

### Consequences

* Good: static and parameterized routes behave the same; `/About` reaches `/about`.
* Bad: a constraint cannot require a case (`{code:[A-Z]+}` also accepts `abc`). Check it in a handler if it matters.
* There is no redirect to a canonical spelling.

### Options not chosen

* **Case-sensitive** — Would break static routes that have matched case-insensitively since 1.0.0.
* **Option** — Adds an options parameter for a rare need.
