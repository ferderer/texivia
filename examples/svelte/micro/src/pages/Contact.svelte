<script lang="ts">
  import MainLayout from "../layouts/MainLayout.svelte";

  let { locale } = $props();
</script>

<MainLayout {locale}>
  {#snippet body()}
    <h1>Contact</h1>
    <p>Have questions or feedback? Reach out to us.</p>
    <p>Email: <a href="mailto:example@texivia.dev">example@texivia.dev</a></p>
  {/snippet}
</MainLayout>
