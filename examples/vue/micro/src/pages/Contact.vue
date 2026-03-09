<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue'

defineProps<{ locale: string }>()
</script>

<template>
  <MainLayout :locale="locale">
    <h1>Contact</h1>
    <p>Have questions or feedback? Reach out to us.</p>
    <p>Email: <a href="mailto:example@texivia.dev">example@texivia.dev</a></p>
  </MainLayout>
</template>
