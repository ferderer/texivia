<script lang="ts">
  let { locale } = $props();
</script>

<header>
  <a class="brand" href="/{locale}/">Texivia</a>
  <nav>
    <a href="/{locale}/">Home</a>
    <a href="/{locale}/login">Login</a>
    <a href="/{locale}/users/1/profile">Profile</a>
  </nav>
</header>
