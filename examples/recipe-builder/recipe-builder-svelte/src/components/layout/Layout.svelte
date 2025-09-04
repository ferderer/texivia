<script lang="ts">
  import Header from './Header.svelte';
  import Footer from './Footer.svelte';

  let { body } = $props();
</script>

<div class="app-layout">
  <Header />
  <main class="main-content">{@render body()}</main>
  <Footer />
</div>

<style>
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
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
