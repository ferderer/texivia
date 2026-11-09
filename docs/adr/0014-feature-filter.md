---
status: accepted
date: 2026-03-15
---

# 0014. Feature filter: only what the platform or a small library does not already solve

## Context and Problem Statement

Many features could be added to the ecosystem. Each one costs size and maintenance.

## Decision Outcome

A feature is added only if it

1. cannot easily be done with CSS, HTML or vanilla JavaScript,
2. is not rarely needed, and
3. has no good small library.

Excluded for that reason, among others: i18n (i18next), validation (zod, valibot), date and number formatting (`Intl`), animation, portals, theming, undo/redo, keyed list diffing.

### Consequences

* Good: the packages stay small and focused.
* Users combine Texivia with the platform and with small libraries.
