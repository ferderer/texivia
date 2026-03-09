<script setup lang="ts">
import { ref, computed } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { recipesStore } from '../stores/recipes'

const searchQuery = ref('')
const selectedDifficulty = ref('')
const sortBy = ref<'rating' | 'cookTime' | 'title'>('rating')
const viewMode = ref<'grid' | 'list'>('grid')

const difficultyOptions = computed(() => [...new Set(recipesStore.recipes.map(r => r.difficulty))])

const filteredRecipes = computed(() =>
  recipesStore.recipes
    .filter(recipe => !searchQuery.value.trim() || recipe.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    .filter(recipe => !selectedDifficulty.value || recipe.difficulty === selectedDifficulty.value)
    .sort((a, b) => {
      switch (sortBy.value) {
        case 'rating': {
          const avgA = a.ratings.reduce((sum, r) => sum + r, 0) / a.ratings.length
          const avgB = b.ratings.reduce((sum, r) => sum + r, 0) / b.ratings.length
          return avgB - avgA
        }
        case 'cookTime':
          return a.cookTime - b.cookTime
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })
)

function clearFilters() {
  searchQuery.value = ''
  selectedDifficulty.value = ''
  sortBy.value = 'rating'
}
</script>

<template>
  <AppLayout>
    <div class="recipes-page">
      <!-- Header -->
      <div class="page-header">
        <h1>All Recipes</h1>
        <p>Discover {{ recipesStore.recipes.length }} amazing recipes from our community</p>
      </div>

      <!-- Filters and Controls -->
      <div class="controls">
        <div class="search-section">
          <input
            type="text"
            placeholder="Search recipes..."
            v-model="searchQuery"
            class="search-input"
          />
        </div>

        <div class="filter-section">
          <select v-model="selectedDifficulty" class="filter-select">
            <option value="">All Difficulties</option>
            <option v-for="difficulty in difficultyOptions" :key="difficulty" :value="difficulty">
              {{ difficulty }}
            </option>
          </select>

          <select v-model="sortBy" class="filter-select">
            <option value="rating">Highest Rated</option>
            <option value="cookTime">Shortest Cook Time</option>
            <option value="title">Alphabetical</option>
          </select>

          <button @click="clearFilters" class="clear-filters">Clear Filters</button>
        </div>

        <div class="view-controls">
          <button
            :class="['view-btn', { active: viewMode === 'grid' }]"
            @click="viewMode = 'grid'"
          >
            ⊞ Grid
          </button>
          <button
            :class="['view-btn', { active: viewMode === 'list' }]"
            @click="viewMode = 'list'"
          >
            ☰ List
          </button>
        </div>
      </div>

      <!-- Results Info -->
      <div class="results-info">
        <span>Showing {{ filteredRecipes.length }} recipes</span>
      </div>

      <!-- Recipe Grid/List -->
      <div :class="['recipes-container', viewMode]">
        <a
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          :href="`/recipe/${recipe.id}`"
          :class="['recipe-card', viewMode]"
        >
          <div class="recipe-image">
            <img :src="recipe.images[0] || '/_/images/placeholder-recipe.jpg'" :alt="recipe.title" />
            <div class="recipe-difficulty">{{ recipe.difficulty }}</div>
          </div>
          <div class="recipe-info">
            <h3>{{ recipe.title }}</h3>
            <div class="recipe-meta">
              <span class="cook-time">🕒 {{ recipe.cookTime }}min</span>
              <span class="rating">⭐ {{ (recipe.ratings.reduce((sum, r) => sum + r, 0) / recipe.ratings.length).toFixed(1) }}</span>
            </div>
          </div>
        </a>

        <div v-if="filteredRecipes.length === 0" class="no-results">
          <h3>No recipes found</h3>
          <p>Try adjusting your filters or search terms</p>
          <button @click="clearFilters" class="btn-primary">Clear Filters</button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.recipes-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.page-header p {
  color: #6b7280;
  font-size: 1.125rem;
}

.controls {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.filter-section {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.9rem;
  min-width: 150px;
}

.clear-filters {
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-filters:hover {
  background: #e5e7eb;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.view-btn.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.view-btn:hover:not(.active) {
  background: #f3f4f6;
}

.results-info {
  margin-bottom: 2rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.recipes-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.recipes-container.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipe-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.recipe-card.grid {
  display: flex;
  flex-direction: column;
}

.recipe-card.list {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.recipe-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.recipe-card.list .recipe-image {
  width: 200px;
  height: 120px;
  flex-shrink: 0;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-difficulty {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  text-transform: capitalize;
}

.recipe-info {
  padding: 1.5rem;
  flex: 1;
}

.recipe-card.list .recipe-info {
  padding: 1rem 1.5rem;
}

.recipe-info h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #1f2937;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  color: #6b7280;
  font-size: 0.9rem;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.no-results h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #374151;
}

.no-results p {
  margin-bottom: 2rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

@media (max-width: 768px) {
  .controls {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .filter-section {
    flex-wrap: wrap;
  }

  .view-controls {
    justify-self: center;
  }

  .recipes-container.grid {
    grid-template-columns: 1fr;
  }

  .recipe-card.list {
    flex-direction: column;
  }

  .recipe-card.list .recipe-image {
    width: 100%;
    height: 200px;
  }
}
</style>
