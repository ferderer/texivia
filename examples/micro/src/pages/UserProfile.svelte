<script lang="ts">
  import UserLayout from "../layouts/UserLayout.svelte";

  let { locale, id } = $props();
</script>

<UserLayout {locale}>
  {#snippet body()}
    <h1>User Profile</h1>
    <p>Locale: {locale}</p>
    <p>User ID: {id}</p>
  {/snippet}
</UserLayout>
