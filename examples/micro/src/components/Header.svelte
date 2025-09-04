<script lang="ts">
  let { locale } = $props();
</script>

<header class="header">
  <h1>Texivia</h1>
  <nav>
    <a href="/{locale}/">Home</a>
    <a href="/{locale}/login">Login</a>
    <a href="/{locale}/users/1/profile">User Profile</a>
  </nav>
  <div class="locale-selector">
    <label for="locale">Select Language:</label>
    <select id="locale" bind:value={locale}>
      <option value="en">English</option>
      <option value="es">Spanish</option>
      <option value="fr">French</option>
    </select>
  </div>
</header>
