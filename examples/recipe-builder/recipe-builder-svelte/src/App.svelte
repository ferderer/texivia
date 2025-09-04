<script lang="ts">
  import { onMount } from 'svelte';
  import { Router } from './lib/texivia-micro';
  import type { Component } from 'svelte';

  // Public pages
  import Home from './pages/Home.svelte';
  import Recipes from './pages/Recipes.svelte';
  import RecipeDetail from './pages/RecipeDetail.svelte';
  import Search from './pages/Search.svelte';
  import Login from './pages/Login.svelte';
  import Register from './pages/Register.svelte';
  import ForgotPassword from './pages/ForgotPassword.svelte';

  // Protected pages
  import Dashboard from './pages/Dashboard.svelte';
  import CreateRecipe from './pages/CreateRecipe.svelte';
  import NotFound from './pages/NotFound.svelte';

  let View = $state(Home);
  let params = $state({});

  const router = new Router<Component<any>>([
    // Public routes
    { path: '/', view: Home },
    { path: '/recipes', view: Recipes },
    { path: '/recipe/{id}', view: RecipeDetail },
    { path: '/search', view: Search },

    // Auth routes
    { path: '/login', view: Login },
    { path: '/register', view: Register },
    { path: '/forgot-password', view: ForgotPassword },

    // Protected routes
    { path: '/dashboard', view: Dashboard },
    { path: '/create', view: CreateRecipe },

    // Catch-all
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
