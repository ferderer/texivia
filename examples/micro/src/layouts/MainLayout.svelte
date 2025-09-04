<script lang="ts">
  import Header from '../components/Header.svelte';
  import Footer from '../components/Footer.svelte';

  let { body, locale } = $props();
</script>

<Header { locale } />
<main>{@render body()}</main>
<Footer { locale } />
