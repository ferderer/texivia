<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

defineProps<{ locale: string }>()
</script>

<template>
  <AppHeader :locale="locale" />
  <main><slot /></main>
  <AppFooter :locale="locale" />
</template>
