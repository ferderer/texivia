<script setup lang="ts">
defineProps<{ locale: string }>()
</script>

<template>
  <footer>
    <p>&copy; 2026 Texivia</p>
    <nav>
      <a :href="`/${locale}/about`">About</a>
      <a :href="`/${locale}/imprint`">Imprint</a>
      <a :href="`/${locale}/contact`">Contact</a>
    </nav>
  </footer>
</template>
