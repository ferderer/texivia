# Recipe API

The backend contract of the Recipe Builder apps (`examples/svelte/recipe-builder`, `examples/vue/recipe-builder`).

| File | |
|---|---|
| [`API.md`](./API.md) | the contract: endpoints, recipe fields and rules, search, errors |
| `seed.json` | the three recipes a backend starts with (also the fixture of the contract test) |
| `reference-server.mjs` | in-memory implementation of the contract, no dependencies (Node 20+) |
| `contract-test.mjs` | checks a running server against the contract |

```bash
node examples/recipe-api/reference-server.mjs               # http://localhost:8080 (PORT=… to change)
node examples/recipe-api/contract-test.mjs                  # test it
node examples/recipe-api/contract-test.mjs http://localhost:9000   # test another backend
```

The apps call `/api/...` on their own origin; the Vite dev server proxies it to `http://localhost:8080`. So start a backend (the reference server or a real one), then `npm run dev` in the app.

Not a workspace member (no `package.json`): the scripts only need Node.
