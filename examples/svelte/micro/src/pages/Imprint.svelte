<script lang="ts">
  import MainLayout from "../layouts/MainLayout.svelte";

  let { locale } = $props();
</script>

<MainLayout {locale}>
  {#snippet body()}
    <h1>Imprint</h1>
    <h2>Responsible</h2>
    <p>Texivia Example App<br>123 Example Street<br>12345 Example City</p>
    <h2>Contact</h2>
    <p>Email: example@texivia.dev</p>
  {/snippet}
</MainLayout>
