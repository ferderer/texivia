# Micro — Svelte 5 + Texivia Router

Minimal Svelte 5 example using `texivia-router` for client-side routing. Demonstrates locale-prefixed routes, parameterized paths, redirects, and a catch-all 404 page.

## Routes

| Path | View |
|------|------|
| `/` | Redirects to `/{locale}/` based on `navigator.language` |
| `/{locale}/` | Landing |
| `/{locale}/login` | Login |
| `/{locale}/users/{id}/profile` | UserProfile |
| `/{locale}/about` | About |
| `/{locale}/imprint` | Imprint |
| `/{locale}/contact` | Contact |
| `*` | NotFound |

## How It Works

Routes are defined in `src/router.ts` using `Router<Component>`. The `App.svelte` root component listens for the `texivia` event to swap the active view and forward route params as props:

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { router } from './router';

  let View = $state(Landing);
  let params = $state({ locale: 'en' });

  function navigate(event: CustomEvent) {
    View = event.detail.view;
    params = event.detail.params ?? {};
  }

  onMount(() => {
    router.start();
    document.addEventListener('texivia', navigate as EventListener);
    return () => {
      router.stop();
      document.removeEventListener('texivia', navigate as EventListener);
    };
  });
</script>

<View {...params} />
```

## Setup

```sh
npm install
npm run dev
```
