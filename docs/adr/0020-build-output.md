---
status: accepted
date: 2026-11-09
---

# 0020. Build output: ES and CommonJS with separate types; private members are mangled

## Context and Problem Statement

Packages are written in TypeScript as ES modules (`"type": "module"`). Consumers use `import` and `require`, bundlers and Node, with various TypeScript module settings. Size matters, especially for the router.

## Considered Options

* ES and CommonJS builds with type declarations per module system
* ES only
* An additional UMD/IIFE bundle for CDN use

## Decision Outcome

Chosen option: **ES and CommonJS**. The shared vite config builds `dist/<name>.mjs` and `dist/<name>.cjs` (the router keeps the base name `texivia`). `tsc` emits `dist/*.d.ts`; a build script copies them to `dist/*.d.cts`. `exports` gives each condition its own types:

```json
"exports": {
  ".": {
    "import":  { "types": "./dist/index.d.ts",  "default": "./dist/index.mjs" },
    "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
  }
}
```

A Terser step minifies both outputs and renames ("mangles") every property whose name starts with `_`.

### Consequences

* Good: `import` and `require` work at runtime and in TypeScript (`node16`/`nodenext`, `bundler`, `node10`).
* Good: mangling private members is a large part of the router's small size.
* Bad: code that reaches into `_` members, including subclasses, breaks against the published build.
* No script-tag bundle; use an ESM CDN such as esm.sh or jsDelivr.

### Options not chosen

* **ES only** — Breaks `require` users.
* **UMD/IIFE** — Not needed for npm users; may come later.
