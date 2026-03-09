<script setup lang="ts">
import MainLayout from '../layouts/MainLayout.vue'

defineProps<{ locale: string, id: string }>()
</script>

<template>
  <MainLayout :locale="locale">
    <h1>User Profile</h1>
    <p>Locale: {{ locale }}</p>
    <p>User ID: {{ id }}</p>
  </MainLayout>
</template>
