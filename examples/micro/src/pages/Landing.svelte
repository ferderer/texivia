<script lang="ts">
  import MainLayout from "../layouts/MainLayout.svelte";

  let { locale } = $props();
</script>

<MainLayout { locale }>
  {#snippet body()}
    <h1>Welcome to Texivia</h1>
    <p>Your one-stop solution for all your text processing needs.</p>
    <p>Locale: {locale}</p>
    <p>Explore our features and services tailored just for you.</p>
    <p>Get started by signing up or logging in!</p>
    <p>Already have an account? <a href="/{locale}/login">Login here</a></p>
  {/snippet}
</MainLayout>
