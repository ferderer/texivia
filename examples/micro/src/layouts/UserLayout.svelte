<script lang="ts">
  import Footer from "../components/Footer.svelte";
  import Header from "../components/Header.svelte";

  let { body, locale } = $props();
</script>

<Header {locale} />
<main>{@render body()}</main>
<Footer {locale} />
