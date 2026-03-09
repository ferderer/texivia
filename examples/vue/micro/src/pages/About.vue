<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue'

defineProps<{ locale: string }>()
</script>

<template>
  <MainLayout :locale="locale">
    <h1>About</h1>
    <p>Texivia is a lightweight, framework-agnostic router for single-page applications.</p>
    <p>Built with TypeScript, it compiles all routes into a single regex for fast O(1) matching.</p>
  </MainLayout>
</template>
