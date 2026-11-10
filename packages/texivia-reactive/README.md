# texivia-reactive

Shallow Proxy-based reactive state with `batch()`. Zero dependencies, part of the [Texivia](https://github.com/ferderer/texivia) ecosystem.

```
npm install texivia-reactive
```

```ts
import { reactive, batch } from 'texivia-reactive';

const state = reactive({ count: 0, name: '' }, () => render());

state.count = 1;                 // one notification

batch(() => {                    // grouped writes: one notification at the end
  state.count = 0;
  state.name = '';
});
```

- `reactive(obj, notify)` returns a Proxy that calls `notify()` on every write that changes a value. Writing the same value does nothing. Only the top level is observed; wrap nested objects separately.
- `batch(fn)` suppresses notifications while `fn` runs, then calls the `notify` function of every reactive object that changed, once each (also across objects, e.g. component state and the global store). Nested batches defer to the outermost one.

ES module and CommonJS builds, each with type declarations. Apache-2.0.
