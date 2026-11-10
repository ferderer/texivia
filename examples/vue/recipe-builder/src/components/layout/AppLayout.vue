<script setup lang="ts">
import AppHeader from './AppHeader.vue';
import AppFooter from './AppFooter.vue';
import { computed } from 'vue';
import { recipesStore } from '../../stores/recipes';
import { describeError } from '../../lib/api/errors';

const loadError = computed(() => recipesStore.state.error ? describeError(recipesStore.state.error) : '');
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <div v-if="loadError" class="api-error" role="alert">
      <span>{{ loadError }}</span>
      <button @click="recipesStore.loadRecipes()">Retry</button>
    </div>
    <main class="main-content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.api-error {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 2rem;
  background: #fef2f2;
  color: #991b1b;
  border-bottom: 1px solid #fecaca;
}

.api-error button {
  padding: 0.25rem 0.75rem;
  border: 1px solid #991b1b;
  border-radius: 0.375rem;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}
</style>
