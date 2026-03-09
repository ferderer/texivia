<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue'

defineProps<{ locale: string }>()
</script>

<template>
  <MainLayout :locale="locale">
    <h1>Imprint</h1>
    <h2>Responsible</h2>
    <p>Texivia Example App<br>123 Example Street<br>12345 Example City</p>
    <h2>Contact</h2>
    <p>Email: example@texivia.dev</p>
  </MainLayout>
</template>
