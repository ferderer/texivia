# Micro — Vue 3 + Texivia Router

Minimal Vue 3 example using `texivia-router` for client-side routing. Demonstrates locale-prefixed routes, parameterized paths, redirects, and a catch-all 404 page.

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

Routes are defined in `src/router.ts` using `Router<Component>`. The `App.vue` root component listens for the `texivia` event to swap the active view and forward route params as props:

```vue
<script setup lang="ts">
import { shallowRef, ref, onMounted, onUnmounted, type Component } from 'vue'
import { router } from './router'

const View = shallowRef<Component>(Landing)
const params = ref<Record<string, string>>({})

function navigate(event: Event) {
  const detail = (event as CustomEvent).detail
  View.value = detail.view
  params.value = detail.params ?? {}
}

onMounted(() => { router.start(); document.addEventListener('texivia', navigate) })
onUnmounted(() => { router.stop(); document.removeEventListener('texivia', navigate) })
</script>

<template>
  <component :is="View" v-bind="params" />
</template>
```

## Setup

```sh
npm install
npm run dev
```
