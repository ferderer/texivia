<script lang="ts">
  import MainLayout from "../layouts/MainLayout.svelte";

  let { locale } = $props();
</script>

<MainLayout {locale}>
  {#snippet body()}
    <h1>About</h1>
    <p>Texivia is a lightweight, framework-agnostic router for single-page applications.</p>
    <p>Built with TypeScript, it compiles all routes into a single regex for fast O(1) matching.</p>
  {/snippet}
</MainLayout>
