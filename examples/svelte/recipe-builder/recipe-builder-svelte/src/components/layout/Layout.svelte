<script lang="ts">
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import { recipesStore } from '../../stores/recipes.svelte.js';
  import { describeError } from '../../lib/api/errors';

  let { body } = $props();

  let loadError = $derived(recipesStore.state.error ? describeError(recipesStore.state.error) : '');
</script>

<div class="app-layout">
  <Header />
  {#if loadError}
    <div class="api-error" role="alert">
      <span>{loadError}</span>
      <button onclick={() => recipesStore.loadRecipes()}>Retry</button>
    </div>
  {/if}
  <main class="main-content">{@render body()}</main>
  <Footer />
</div>

<style>
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .api-error {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 2rem;
    background: #fef2f2;
    color: #991b1b;
    border-bottom: 1px solid #fecaca;
  }

  .api-error button {
    padding: 0.25rem 0.75rem;
    border: 1px solid #991b1b;
    border-radius: 0.375rem;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .main-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  @media (max-width: 768px) {
    .main-content {
      padding: 1rem;
    }
  }
</style>
