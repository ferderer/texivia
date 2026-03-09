<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { recipesStore } from '../stores/recipes'
import { router } from '../router'
import type { Ingredient, Instruction, Recipe } from '../lib/api/types'

const currentStep = ref(1)
const isLoading = ref(false)
const error = ref('')

// Form data
const title = ref('')
const description = ref('')
const servings = ref(4)
const prepTime = ref(15)
const cookTime = ref(30)
const difficulty = ref<'easy' | 'medium' | 'hard'>('medium')
const cuisine = ref('')
const dietaryTags = ref<string[]>([])
const ingredients = reactive<Ingredient[]>([{ name: '', quantity: 1, unit: 'cup' }])
const instructions = reactive<Instruction[]>([{ step: 1, description: '', duration: 0 }])
const images = ref<string[]>([])

// Available options
const cuisineOptions = ['Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'French', 'Thai', 'Japanese', 'Mediterranean', 'British']
const dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'keto', 'paleo']
const unitOptions = ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'clove', 'slice']

const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return title.value.trim() && description.value.trim() && servings.value > 0 && prepTime.value > 0 && cookTime.value > 0 && cuisine.value
    case 2:
      return ingredients.length > 0 && ingredients.every(ing => ing.name.trim() && ing.quantity > 0)
    case 3:
      return instructions.length > 0 && instructions.every(inst => inst.description.trim())
    case 4:
      return true
    default:
      return false
  }
})

function nextStep() {
  if (isStepValid.value && currentStep.value < 4) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function addIngredient() {
  ingredients.push({ name: '', quantity: 1, unit: 'cup' })
}

function removeIngredient(index: number) {
  ingredients.splice(index, 1)
}

function addInstruction() {
  instructions.push({
    step: instructions.length + 1,
    description: '',
    duration: 0
  })
}

function removeInstruction(index: number) {
  instructions.splice(index, 1)
  instructions.forEach((inst, i) => { inst.step = i + 1 })
}

function toggleDietaryTag(tag: string) {
  const idx = dietaryTags.value.indexOf(tag)
  if (idx >= 0) {
    dietaryTags.value.splice(idx, 1)
  } else {
    dietaryTags.value.push(tag)
  }
}

function handleImageUpload(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    const newImages = Array.from(input.files).map((_, i) => `/_/images/recipe-${Date.now()}-${i}.jpg`)
    images.value = [...images.value, ...newImages]
  }
}

function removeImage(index: number) {
  images.value = images.value.filter((_, i) => i !== index)
}

async function submitRecipe() {
  if (!isStepValid.value) return

  isLoading.value = true
  error.value = ''

  try {
    const newRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.value,
      description: description.value,
      servings: servings.value,
      prepTime: prepTime.value,
      cookTime: cookTime.value,
      difficulty: difficulty.value,
      cuisine: cuisine.value,
      dietaryTags: [...dietaryTags.value],
      ingredients: [...ingredients],
      instructions: [...instructions],
      nutrition: {
        calories: Math.round(200 + Math.random() * 400),
        protein: Math.round(10 + Math.random() * 30),
        carbs: Math.round(20 + Math.random() * 40),
        fat: Math.round(5 + Math.random() * 25),
        fiber: Math.round(2 + Math.random() * 10),
        sugar: Math.round(1 + Math.random() * 15)
      },
      images: images.value.length > 0 ? [...images.value] : ['/_/images/placeholder-recipe.jpg'],
      author: 'John Doe',
      ratings: []
    }

    await recipesStore.addRecipe(newRecipe)
    router.navigate('/dashboard')
  } catch {
    error.value = 'Failed to create recipe. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="create-recipe-page">
      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${(currentStep / 4) * 100}%` }"></div>
        </div>
        <div class="step-indicators">
          <div v-for="i in 4" :key="i" :class="['step-indicator', { active: i <= currentStep }]">
            {{ i }}
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div class="wizard-container">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Step 1: Basic Info -->
        <div v-if="currentStep === 1" class="step-content">
          <h2>Basic Information</h2>
          <p>Tell us about your recipe</p>

          <div class="form-grid">
            <div class="form-group full-width">
              <label for="title">Recipe Title *</label>
              <input
                id="title"
                type="text"
                v-model="title"
                placeholder="Enter recipe title"
                class="form-input"
              />
            </div>

            <div class="form-group full-width">
              <label for="description">Description *</label>
              <textarea
                id="description"
                v-model="description"
                placeholder="Describe your recipe..."
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="servings">Servings *</label>
              <input
                id="servings"
                type="number"
                v-model.number="servings"
                min="1"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="prepTime">Prep Time (minutes) *</label>
              <input
                id="prepTime"
                type="number"
                v-model.number="prepTime"
                min="0"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="cookTime">Cook Time (minutes) *</label>
              <input
                id="cookTime"
                type="number"
                v-model.number="cookTime"
                min="0"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="difficulty">Difficulty *</label>
              <select id="difficulty" v-model="difficulty" class="form-select">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div class="form-group">
              <label for="cuisine">Cuisine *</label>
              <select id="cuisine" v-model="cuisine" class="form-select">
                <option value="">Select cuisine</option>
                <option v-for="option in cuisineOptions" :key="option" :value="option">{{ option }}</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label>Dietary Tags</label>
              <div class="tag-grid">
                <label v-for="tag in dietaryOptions" :key="tag" class="tag-checkbox">
                  <input
                    type="checkbox"
                    :checked="dietaryTags.includes(tag)"
                    @change="toggleDietaryTag(tag)"
                  />
                  {{ tag }}
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Ingredients -->
        <div v-else-if="currentStep === 2" class="step-content">
          <h2>Ingredients</h2>
          <p>Add all the ingredients needed for your recipe</p>

          <div class="ingredients-list">
            <div v-for="(ingredient, index) in ingredients" :key="index" class="ingredient-row">
              <input
                type="number"
                v-model.number="ingredient.quantity"
                min="0"
                step="0.25"
                class="quantity-input"
                placeholder="1"
              />

              <select v-model="ingredient.unit" class="unit-select">
                <option v-for="unit in unitOptions" :key="unit" :value="unit">{{ unit }}</option>
              </select>

              <input
                type="text"
                v-model="ingredient.name"
                placeholder="Ingredient name"
                class="ingredient-input"
              />

              <input
                type="text"
                v-model="ingredient.notes"
                placeholder="Notes (optional)"
                class="notes-input"
              />

              <button
                type="button"
                @click="removeIngredient(index)"
                class="remove-btn"
                :disabled="ingredients.length === 1"
              >
                ✕
              </button>
            </div>
          </div>

          <button type="button" @click="addIngredient" class="add-btn">
            ➕ Add Ingredient
          </button>
        </div>

        <!-- Step 3: Instructions -->
        <div v-else-if="currentStep === 3" class="step-content">
          <h2>Instructions</h2>
          <p>Break down your recipe into clear, step-by-step instructions</p>

          <div class="instructions-list">
            <div v-for="(instruction, index) in instructions" :key="index" class="instruction-row">
              <div class="step-number">{{ instruction.step }}</div>

              <div class="instruction-content">
                <textarea
                  v-model="instruction.description"
                  placeholder="Describe this step..."
                  class="instruction-textarea"
                  rows="2"
                ></textarea>

                <div class="instruction-meta">
                  <label>
                    Duration (minutes):
                    <input
                      type="number"
                      v-model.number="instruction.duration"
                      min="0"
                      class="duration-input"
                      placeholder="0"
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                @click="removeInstruction(index)"
                class="remove-btn"
                :disabled="instructions.length === 1"
              >
                ✕
              </button>
            </div>
          </div>

          <button type="button" @click="addInstruction" class="add-btn">
            ➕ Add Step
          </button>
        </div>

        <!-- Step 4: Photos -->
        <div v-else-if="currentStep === 4" class="step-content">
          <h2>Photos</h2>
          <p>Add photos to make your recipe more appealing (optional)</p>

          <div class="image-upload-area">
            <input
              type="file"
              accept="image/*"
              multiple
              @change="handleImageUpload"
              class="file-input"
              id="images"
            />

            <label for="images" class="upload-label">
              <div class="upload-content">
                <span class="upload-icon">📷</span>
                <p>Click to upload photos</p>
                <p class="upload-hint">PNG, JPG up to 10MB each</p>
              </div>
            </label>
          </div>

          <div v-if="images.length > 0" class="image-preview">
            <h4>Uploaded Images</h4>
            <div class="image-grid">
              <div v-for="(image, index) in images" :key="index" class="image-item">
                <img :src="image" :alt="`Recipe photo ${index + 1}`" />
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="remove-image-btn"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation Buttons -->
        <div class="wizard-navigation">
          <button
            type="button"
            @click="prevStep"
            class="nav-btn secondary"
            :disabled="currentStep === 1"
          >
            ← Previous
          </button>

          <div class="step-info">
            Step {{ currentStep }} of 4
          </div>

          <button
            v-if="currentStep < 4"
            type="button"
            @click="nextStep"
            class="nav-btn primary"
            :disabled="!isStepValid"
          >
            Next →
          </button>
          <button
            v-else
            type="button"
            @click="submitRecipe"
            class="nav-btn primary"
            :disabled="!isStepValid || isLoading"
          >
            <template v-if="isLoading">
              <span class="spinner"></span>
              Creating...
            </template>
            <template v-else>
              Create Recipe
            </template>
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.create-recipe-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1rem;
}

.progress-container {
  margin-bottom: 3rem;
}

.progress-bar {
  width: 100%;
  height: 0.5rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: #2563eb;
  transition: width 0.3s ease;
}

.step-indicators {
  display: flex;
  justify-content: space-between;
  max-width: 200px;
  margin: 0 auto;
}

.step-indicator {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.2s;
}

.step-indicator.active {
  background: #2563eb;
  color: white;
}

.wizard-container {
  background: white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.step-content h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.step-content p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.form-input, .form-select, .form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition: border-color 0.2s;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.tag-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.tag-checkbox:hover {
  border-color: #2563eb;
  background: #f8fafc;
}

.ingredients-list, .instructions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.ingredient-row {
  display: grid;
  grid-template-columns: 80px 100px 1fr 150px 40px;
  gap: 0.75rem;
  align-items: center;
}

.quantity-input, .unit-select, .ingredient-input, .notes-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.instruction-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
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
  margin-top: 0.5rem;
}

.instruction-content {
  flex: 1;
}

.instruction-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  resize: vertical;
  margin-bottom: 0.5rem;
}

.instruction-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.duration-input {
  width: 80px;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
}

.remove-btn {
  width: 2rem;
  height: 2rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover:not(:disabled) {
  background: #fecaca;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-btn {
  background: #f3f4f6;
  color: #374151;
  padding: 0.75rem 1rem;
  border: 1px dashed #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.add-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.image-upload-area {
  margin-bottom: 2rem;
}

.file-input {
  display: none;
}

.upload-label {
  display: block;
  padding: 3rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-label:hover {
  border-color: #2563eb;
  background: #f8fafc;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.upload-hint {
  color: #6b7280;
  font-size: 0.875rem;
}

.image-preview h4 {
  margin-bottom: 1rem;
  color: #374151;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.image-item {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
}

.image-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background: rgba(0,0,0,0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.75rem;
}

.wizard-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-btn.primary {
  background: #2563eb;
  color: white;
}

.nav-btn.primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.nav-btn.secondary {
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.nav-btn.secondary:hover:not(:disabled) {
  border-color: #d1d5db;
  background: #f9fafb;
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .wizard-container {
    padding: 2rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .ingredient-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .wizard-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
