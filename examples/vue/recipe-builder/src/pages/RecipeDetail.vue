<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { recipesStore } from '../stores/recipes'

const props = defineProps<{ id: string }>()

const recipe = computed(() => recipesStore.recipes.find(r => r.id === props.id))
const averageRating = computed(() => recipe.value ? recipe.value.ratings.reduce((sum, r) => sum + r, 0) / recipe.value.ratings.length : 0)
const totalTime = computed(() => recipe.value ? recipe.value.prepTime + recipe.value.cookTime : 0)

const activeTab = ref<'ingredients' | 'instructions' | 'nutrition'>('ingredients')
const servings = ref(4)

const scaledIngredients = computed(() =>
  recipe.value ? recipe.value.ingredients.map(ing => ({
    ...ing,
    quantity: (ing.quantity * servings.value) / (recipe.value!.servings || 1)
  })) : []
)

onMounted(() => {
  if (recipe.value) {
    servings.value = recipe.value.servings
  }
})
</script>

<template>
  <AppLayout>
    <div v-if="recipe" class="recipe-detail">
      <!-- Back Navigation -->
      <div class="back-nav">
        <a href="/recipes">← Back to Recipes</a>
      </div>

      <!-- Recipe Header -->
      <div class="recipe-header">
        <div class="recipe-image">
          <img :src="recipe.images[0] || '/_/images/placeholder-recipe.jpg'" :alt="recipe.title" />
          <div class="recipe-badges">
            <span :class="['difficulty-badge', recipe.difficulty]">{{ recipe.difficulty }}</span>
            <span v-for="tag in recipe.dietaryTags" :key="tag" class="diet-badge">{{ tag }}</span>
          </div>
        </div>

        <div class="recipe-info">
          <h1>{{ recipe.title }}</h1>
          <p class="description">{{ recipe.description }}</p>

          <div class="recipe-meta">
            <div class="meta-item">
              <span class="label">Rating</span>
              <span class="value">⭐ {{ averageRating.toFixed(1) }} ({{ recipe.ratings.length }} reviews)</span>
            </div>
            <div class="meta-item">
              <span class="label">Prep Time</span>
              <span class="value">{{ recipe.prepTime }} min</span>
            </div>
            <div class="meta-item">
              <span class="label">Cook Time</span>
              <span class="value">{{ recipe.cookTime }} min</span>
            </div>
            <div class="meta-item">
              <span class="label">Total Time</span>
              <span class="value">{{ totalTime }} min</span>
            </div>
            <div class="meta-item">
              <span class="label">Servings</span>
              <span class="value">{{ recipe.servings }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Cuisine</span>
              <span class="value">{{ recipe.cuisine }}</span>
            </div>
          </div>

          <div class="recipe-actions">
            <button class="btn-primary">Save Recipe</button>
            <button class="btn-secondary">Share</button>
            <a :href="`/cook/${recipe.id}`" class="btn-cook">Start Cooking</a>
          </div>
        </div>
      </div>

      <!-- Recipe Content Tabs -->
      <div class="recipe-content">
        <div class="tabs">
          <button :class="['tab', { active: activeTab === 'ingredients' }]" @click="activeTab = 'ingredients'">
            Ingredients
          </button>
          <button :class="['tab', { active: activeTab === 'instructions' }]" @click="activeTab = 'instructions'">
            Instructions
          </button>
          <button :class="['tab', { active: activeTab === 'nutrition' }]" @click="activeTab = 'nutrition'">
            Nutrition
          </button>
        </div>

        <div class="tab-content">
          <!-- Ingredients -->
          <div v-if="activeTab === 'ingredients'" class="ingredients-section">
            <div class="servings-adjuster">
              <label>Servings:</label>
              <div class="serving-controls">
                <button @click="servings = Math.max(1, servings - 1)">-</button>
                <span>{{ servings }}</span>
                <button @click="servings++">+</button>
              </div>
            </div>

            <ul class="ingredients-list">
              <li v-for="(ingredient, i) in scaledIngredients" :key="i" class="ingredient-item">
                <span class="quantity">{{ ingredient.quantity % 1 === 0 ? ingredient.quantity.toFixed(0) : ingredient.quantity.toFixed(1) }} {{ ingredient.unit }}</span>
                <span class="name">{{ ingredient.name }}</span>
                <span v-if="ingredient.notes" class="notes">({{ ingredient.notes }})</span>
              </li>
            </ul>
          </div>

          <!-- Instructions -->
          <div v-else-if="activeTab === 'instructions'" class="instructions-section">
            <ol class="instructions-list">
              <li v-for="instruction in recipe.instructions" :key="instruction.step" class="instruction-item">
                <div class="step-number">{{ instruction.step }}</div>
                <div class="step-content">
                  <p>{{ instruction.description }}</p>
                  <span v-if="instruction.duration" class="step-time">⏱️ {{ instruction.duration }} min</span>
                </div>
              </li>
            </ol>
          </div>

          <!-- Nutrition -->
          <div v-else-if="activeTab === 'nutrition'" class="nutrition-section">
            <div class="nutrition-grid">
              <div class="nutrition-item">
                <span class="nutrition-label">Calories</span>
                <span class="nutrition-value">{{ Math.round(recipe.nutrition.calories * servings / recipe.servings) }}</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-label">Protein</span>
                <span class="nutrition-value">{{ Math.round(recipe.nutrition.protein * servings / recipe.servings) }}g</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-label">Carbs</span>
                <span class="nutrition-value">{{ Math.round(recipe.nutrition.carbs * servings / recipe.servings) }}g</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-label">Fat</span>
                <span class="nutrition-value">{{ Math.round(recipe.nutrition.fat * servings / recipe.servings) }}g</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-label">Fiber</span>
                <span class="nutrition-value">{{ Math.round(recipe.nutrition.fiber * servings / recipe.servings) }}g</span>
              </div>
              <div class="nutrition-item">
                <span class="nutrition-label">Sugar</span>
                <span class="nutrition-value">{{ Math.round(recipe.nutrition.sugar * servings / recipe.servings) }}g</span>
              </div>
            </div>

            <div class="nutrition-per-serving">
              <small>Nutrition values shown are for {{ servings }} serving{{ servings !== 1 ? 's' : '' }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="recipe-not-found">
      <h1>Recipe Not Found</h1>
      <p>The recipe you're looking for doesn't exist or has been removed.</p>
      <a href="/recipes" class="btn-primary">Browse All Recipes</a>
    </div>
  </AppLayout>
</template>

<style scoped>
.recipe-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.back-nav {
  margin-bottom: 2rem;
}

.back-nav a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.recipe-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.recipe-image {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.recipe-badges {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.difficulty-badge {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: capitalize;
}

.difficulty-badge.easy { background: #dcfce7; color: #16a34a; }
.difficulty-badge.medium { background: #fef3c7; color: #d97706; }
.difficulty-badge.hard { background: #fee2e2; color: #dc2626; }

.diet-badge {
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.recipe-info h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.description {
  font-size: 1.125rem;
  color: #6b7280;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.recipe-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
}

.meta-item .label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.meta-item .value {
  font-weight: 600;
  color: #1f2937;
}

.recipe-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary, .btn-secondary, .btn-cook {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: white;
  color: #2563eb;
  border: 2px solid #2563eb;
}

.btn-secondary:hover {
  background: #2563eb;
  color: white;
}

.btn-cook {
  background: #16a34a;
  color: white;
}

.btn-cook:hover {
  background: #15803d;
}

.recipe-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  flex: 1;
  padding: 1rem 2rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.tab.active {
  color: #2563eb;
  border-bottom: 2px solid #2563eb;
  background: #f8fafc;
}

.tab:hover:not(.active) {
  color: #374151;
  background: #f9fafb;
}

.tab-content {
  padding: 2rem;
}

.servings-adjuster {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.serving-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.serving-controls button {
  width: 2rem;
  height: 2rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.serving-controls button:hover {
  background: #f3f4f6;
}

.ingredients-list {
  list-style: none;
  padding: 0;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.ingredient-item:last-child {
  border-bottom: none;
}

.quantity {
  font-weight: 600;
  color: #2563eb;
  min-width: 80px;
}

.name {
  flex: 1;
  color: #1f2937;
}

.notes {
  color: #6b7280;
  font-style: italic;
  font-size: 0.875rem;
}

.instructions-list {
  list-style: none;
  padding: 0;
}

.instruction-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.instruction-item:last-child {
  border-bottom: none;
}

.step-number {
  width: 2rem;
  height: 2rem;
  background: #2563eb;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content p {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.step-time {
  color: #6b7280;
  font-size: 0.875rem;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.nutrition-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
}

.nutrition-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.nutrition-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.nutrition-per-serving {
  text-align: center;
  color: #6b7280;
}

.recipe-not-found {
  text-align: center;
  padding: 4rem 2rem;
}

.recipe-not-found h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #374151;
}

.recipe-not-found p {
  color: #6b7280;
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .recipe-header {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .recipe-meta {
    grid-template-columns: 1fr;
  }

  .recipe-actions {
    flex-direction: column;
  }

  .tabs {
    flex-direction: column;
  }

  .nutrition-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
