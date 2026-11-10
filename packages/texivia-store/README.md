# texivia-store

A global reactive store with subscriptions. Part of the [Texivia](https://github.com/ferderer/texivia) ecosystem; depends on `texivia-reactive`.

```
npm install texivia-store
```

```ts
import { store, subscribe, batchStore } from 'texivia-store';

const unsubscribe = subscribe(() => console.log('store changed', store.theme));

store.user = { name: 'Alice' };            // subscribers are notified

batchStore(() => {                         // one notification for both writes
  store.theme = 'dark';
  store.lang = 'de';
});

unsubscribe();
```

- `store` is a shallow reactive object; assigning a changed value notifies all subscribers.
- `subscribe(fn)` returns an unsubscribe function.
- `batchStore(fn)` groups writes into one notification.

ES module and CommonJS builds, each with type declarations. Apache-2.0.
