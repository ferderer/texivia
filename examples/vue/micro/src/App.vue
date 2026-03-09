<script setup lang="ts">
import { ref, onMounted, onUnmounted, shallowRef, type Component } from 'vue'
import { router } from './router'
import Landing from './pages/Landing.vue'

const View = shallowRef<Component>(Landing)
const params = ref<Record<string, string>>({ locale: 'en' })

function navigate(event: Event) {
  const detail = (event as CustomEvent).detail
  View.value = detail.view
  params.value = detail?.params || {}
}

onMounted(() => {
  router.start()
  document.addEventListener('texivia', navigate)
})

onUnmounted(() => {
  router.stop()
  document.removeEventListener('texivia', navigate)
})
</script>

<template>
  <component :is="View" v-bind="params" />
</template>
