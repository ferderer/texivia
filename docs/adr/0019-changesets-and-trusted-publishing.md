---
status: accepted
date: 2026-11-09
---

# 0019. Releases via Changesets and npm trusted publishing

## Context and Problem Statement

Five packages need independent versions and changelogs. Publishing used a long-lived npm token stored in GitHub.

## Considered Options

* Changesets with npm trusted publishing (OIDC)
* `npm publish` of one package on a GitHub Release
* A custom per-package tag workflow

## Decision Outcome

Chosen option: **Changesets and trusted publishing**. Every change that affects users adds a changeset (`npx changeset`). On `main`, the release workflow opens a "Version Packages" pull request that bumps versions, writes changelogs and updates internal ranges. Merging it publishes every package whose version is not on npm yet, tags it `<package>@<version>` and creates a GitHub release. npm authenticates the workflow via OIDC; no npm token is stored.

### Consequences

* Good: independent versions, generated changelogs, provenance, no secret to leak.
* A package must exist on npm before a trusted publisher can be configured; new packages are published once by hand.
