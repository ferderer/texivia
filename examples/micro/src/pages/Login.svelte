<script lang="ts">
  import SimpleLayout from "../layouts/SimpleLayout.svelte";

  let { locale } = $props();
</script>

<SimpleLayout {locale}>
  {#snippet body()}
    <h1>Login</h1>
    <form method="POST" action="/{locale}/login">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" required />
      <br />
      <label for="password">Password:</label>
      <input type="password" id="password" name="password" required />
      <br />
      <button type="submit">Login</button>
      <p>Don't have an account? <a href="/register">Register here</a></p>
      <p>Forgot your password? <a href="/reset-password">Reset it here</a></p>
    </form>
  {/snippet}
</SimpleLayout>
