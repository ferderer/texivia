<script lang="ts">
  import { onMount } from 'svelte';
  import { Router } from './lib/texivia-micro';
  import type { Component } from 'svelte';
  import Landing from './pages/Landing.svelte';
  import Login from './pages/Login.svelte';
  import UserProfile from './pages/UserProfile.svelte';
  import NotFound from './pages/NotFound.svelte';

  let View = $state(Landing);
  let params = $state({ 'locale': 'en'});

  const router = new Router<Component<any>>([
    { path: '/', handler: () => `/${navigator.language}/` },
    { path: '/{locale}/', view: Landing },
    { path: '/{locale}/login', view: Login },
    { path: '/{locale}/users/{id:\\d+}/profile', view: UserProfile },
    { path: '*', view: NotFound },
  ]);

  function navigate(event: CustomEvent) {
    View = event.detail.view;
    params = event.detail?.params || {};
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
