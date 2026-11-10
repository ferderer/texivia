# Recipe Builder (Svelte 5)

A recipe site built with the Texivia packages: `texivia-router` for the pages, `texivia-fetch` for the API. Plain Svelte 5 without SvelteKit, runes only.

```bash
# from the repository root: the apps depend on the built packages
npm ci && npm run build -w packages

node examples/recipe-api/reference-server.mjs     # the backend, http://localhost:8080
cd examples/svelte/recipe-builder/recipe-builder-svelte
npm ci && npm run dev                              # the Vite dev server proxies /api to port 8080
```

Any backend that follows [`examples/recipe-api/API.md`](../../recipe-api/API.md) works instead of the reference server.

| Path | |
|---|---|
| `src/router.ts` | the router singleton, one route per page |
| `src/App.svelte` | the only listener of the `texivia` event (added before `router.start()`) |
| `src/lib/api/` | `endpoints.ts` (paths), `index.ts` (typed `api.recipes.*` on `apiFetch`), `types.ts`, `errors.ts` (`describeError`) |
| `src/stores/recipes.svelte.ts` | the recipes (rune store): `loadRecipes`, `ensureLoaded`, `loadRecipe`, `addRecipe`, … |
| `src/pages/` | one component per page; the Search page asks the server (debounced, cancels the previous request) |

Login, register and the dashboard user are mock-ups; the API has no authentication yet.
