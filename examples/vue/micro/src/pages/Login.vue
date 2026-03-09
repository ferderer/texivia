<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue'

defineProps<{ locale: string }>()
</script>

<template>
  <MainLayout :locale="locale">
    <h1>Login</h1>
    <form class="login-form" method="POST" :action="`/${locale}/login`">
      <label for="username">Username</label>
      <input type="text" id="username" name="username" required />
      <label for="password">Password</label>
      <input type="password" id="password" name="password" required />
      <button type="submit">Login</button>
      <p>Don't have an account? <a :href="`/${locale}/register`">Register here</a></p>
    </form>
  </MainLayout>
</template>
