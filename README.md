# Texivia Ecosystem

A constellation of atomic, independently versioned packages for building vanilla JS SPAs.
No mandatory framework. No bundled opinions. Each package does one thing.

## Packages

| Package | Version | Description |
|---|---|---|
| [`texivia-router`](./packages/texivia-router) | 1.0.0 | 1.4 kB framework-agnostic router with compiled regex matching |
| [`texivia-reactive`](./packages/texivia-reactive) | 1.0.0 | Proxy-based reactive state with `batch()` |
| [`texivia-component`](./packages/texivia-component) | 1.0.0 | Component factory — `@bind`, `@event`, event delegation |
| [`texivia-store`](./packages/texivia-store) | 1.0.0 | Global reactive store |
| [`texivia-fetch`](./packages/texivia-fetch) | 1.0.0 | Typed fetch wrapper with structured error handling |

Auth packages (`texivia-session`, `texivia-oidc`) are planned.

## Dependency graph

```
texivia-router                         (no ecosystem deps)
texivia-reactive                       (no ecosystem deps)
texivia-fetch                          (no ecosystem deps)
texivia-component  → texivia-reactive
texivia-store      → texivia-reactive
texivia-oidc       → texivia-store, texivia-fetch   (planned)
texivia-session    → texivia-store                  (planned)
```

Leaf packages have zero intra-ecosystem dependencies and can be used in complete isolation.

## Quick start

```bash
npm install texivia-router texivia-component
```

```js
// router.js
import { Router }    from 'texivia-router';
import { Home }      from './pages/Home.js';
import { Dashboard } from './pages/Dashboard.js';

export const router = new Router([
  { path: '/',          view: Home      },
  { path: '/dashboard', view: Dashboard,
    handler: async () => {
      if (!await auth.isAuthenticated()) return '/login';
      return true;
    }
  },
]);

// app.js
import { setupEvents } from 'texivia-component';
import { router }      from './router.js';

const app = document.getElementById('app');
let current = null;

document.addEventListener('texivia', ({ detail: { view, params } }) => {
  current?.unmount();
  current = view(params);
  current.mount(app);
});

setupEvents();
router.start();

// pages/Home.js
import { component } from 'texivia-component';

export const Home = component({
  state: { count: 0 },
  template: ({ count }) => `
    <h1>Count: ${count}</h1>
    <button @click="inc">+</button>
  `,
  inc(ctx) { ctx.state.count++; },
});
```

## Component API

### `component(def)`

| Property | Type | Description |
|---|---|---|
| `state` | `object` | Initial reactive state |
| `template` | `(state & props) => string` | Returns HTML string |
| `afterRender` | `(container, ctx) => void` | Called after each render |
| `...methods` | `(ctx, event?) => void` | Called by `@event` directives |

### `ctx` inside methods and `afterRender`

| Property | Description |
|---|---|
| `ctx.state` | Reactive state — mutate directly to trigger re-render |
| `ctx.props` | Props passed at instantiation (route params) |
| `ctx.batch(fn)` | Group writes — one re-render at the end |
| `ctx.signal` | `AbortSignal` — aborted on unmount; pass to `apiFetch` |

### Template directives

| Directive | Description |
|---|---|
| `@click="method"` | Calls `method(ctx, event)` on click |
| `@submit.prevent="method"` | Calls method + `e.preventDefault()` |
| `@click.stop="method"` | Calls method + `e.stopPropagation()` |
| `@click.once="method"` | Fires once, then becomes a no-op |
| `@bind="key"` | Two-way binding for inputs, textarea, select |

### `apiFetch`

```ts
const { payload, error } = await apiFetch<User>('/api/me', null, {
  method: 'GET',
  signal: ctx.signal,   // cancelled automatically on navigation
});

if (error) {
  if (error[2] === 'E_ABORTED') return; // navigated away — not an error
  showError(error[2]);
  return;
}

use(payload);
```

## Examples

- [`examples/vanilla-demo`](./examples/vanilla-demo) — counter, recipe detail (async load + abort), contact form (all `@bind` variants)
- [`examples/svelte`](./examples/svelte) — Svelte 5 (no SvelteKit): `micro` and the `recipe-builder` sample app
- [`examples/vue`](./examples/vue) — Vue 3: `micro` and the `recipe-builder` sample app

The Svelte and Vue examples are standalone projects: build the router first (`npm run build -w packages/texivia-router`), then run `npm ci && npm run dev` in the example folder.

## Architecture decisions

Architecture decision records will be published here at a later point.

## Monorepo

```bash
npm install          # install all workspaces
npm run build        # build all packages (tests import texivia-reactive from its dist/)
npm test             # run all test suites
npm run dev          # start vanilla-demo dev server
```

Releases are managed with [Changesets](https://github.com/changesets/changesets): run `npx changeset` to describe a change; merging the generated "Version Packages" pull request publishes the changed packages to npm.

## License

Apache-2.0 — Vadim Ferderer (https://ferderer.de/)
