---
status: accepted
date: 2026-03-09
---

# 0010. Which link clicks the router handles

## Context and Problem Statement

The router intercepts clicks on `<a>` elements so plain links navigate without a page load. It must not break links that the browser should handle.

## Decision Outcome

The router handles a click only if all of these hold:

* left button, no modifier key (Ctrl, Meta, Shift, Alt);
* the link has the same origin as the page and is not a hash-only link (`href="#…"`);
* `target` is empty or `_self`;
* no `download` attribute, no `rel="external"`, no `no-router` attribute.

Other `rel` values (such as `nofollow`) do not matter.

### Consequences

* Good: new tabs, downloads, external links and in-page anchors keep their browser behavior; `no-router` is the explicit opt-out.
