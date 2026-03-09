<!-- src/pages/CreateRecipe.svelte -->
<script lang="ts">
  import Layout from '../components/layout/Layout.svelte';
  import { recipesStore } from '../stores/recipes.svelte.js';
  import type { Recipe, Ingredient, Instruction } from '../stores/recipes.svelte.js';

  let currentStep: number = $state(1);
  let isLoading: boolean = $state(false);
  let error: string = $state('');

  // Form data
  let title: string = $state('');
  let description: string = $state('');
  let servings: number = $state(4);
  let prepTime: number = $state(15);
  let cookTime: number = $state(30);
  let difficulty: 'easy' | 'medium' | 'hard' = $state('medium');
  let cuisine: string = $state('');
  let dietaryTags: string[] = $state([]);
  let ingredients: Ingredient[] = $state([{ name: '', quantity: 1, unit: 'cup' }]);
  let instructions: Instruction[] = $state([{ step: 1, description: '', duration: 0 }]);
  let images: string[] = $state([]);

  // Available options
  let cuisineOptions = ['Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'French', 'Thai', 'Japanese', 'Mediterranean', 'British'];
  let dietaryOptions = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'low-carb', 'keto', 'paleo'];
  let unitOptions = ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 'clove', 'slice'];

  // Form validation
  let isStepValid = $derived((() => {
    switch (currentStep) {
      case 1:
        return title.trim() && description.trim() && servings > 0 && prepTime > 0 && cookTime > 0 && cuisine;
      case 2:
        return ingredients.length > 0 && ingredients.every(ing => ing.name.trim() && ing.quantity > 0);
      case 3:
        return instructions.length > 0 && instructions.every(inst => inst.description.trim());
      case 4:
        return true; // Photos are optional
      default:
        return false;
    }
  })());

  // Step management
  function nextStep() {
    if (isStepValid && currentStep < 4) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  // Ingredient management
  function addIngredient() {
    ingredients = [...ingredients, { name: '', quantity: 1, unit: 'cup' }];
  }

  function removeIngredient(index: number) {
    ingredients = ingredients.filter((_, i) => i !== index);
  }

  // Instruction management
  function addInstruction() {
    instructions = [...instructions, {
      step: instructions.length + 1,
      description: '',
      duration: 0
    }];
  }

  function removeInstruction(index: number) {
    instructions = instructions.filter((_, i) => i !== index);
    // Renumber steps
    instructions = instructions.map((inst, i) => ({ ...inst, step: i + 1 }));
  }

  // Dietary tags management
  function toggleDietaryTag(tag: string) {
    if (dietaryTags.includes(tag)) {
      dietaryTags = dietaryTags.filter(t => t !== tag);
    } else {
      dietaryTags = [...dietaryTags, tag];
    }
  }

  // Mock image upload
  function handleImageUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      // Mock: just add placeholder URLs
      const newImages = Array.from(input.files).map((_, i) => `/_/images/recipe-${Date.now()}-${i}.jpg`);
      images = [...images, ...newImages];
    }
  }

  function removeImage(index: number) {
    images = images.filter((_, i) => i !== index);
  }

  // Submit recipe
  async function submitRecipe() {
    if (!isStepValid) return;

    isLoading = true;
    error = '';

    try {
      const newRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        description,
        servings,
        prepTime,
        cookTime,
        difficulty,
        cuisine,
        dietaryTags,
        ingredients,
        instructions,
        nutrition: {
          calories: Math.round(200 + Math.random() * 400), // Mock nutrition
          protein: Math.round(10 + Math.random() * 30),
          carbs: Math.round(20 + Math.random() * 40),
          fat: Math.round(5 + Math.random() * 25),
          fiber: Math.round(2 + Math.random() * 10),
          sugar: Math.round(1 + Math.random() * 15)
        },
        images: images.length > 0 ? images : ['/_/images/placeholder-recipe.jpg'],
        author: 'John Doe', // Mock user
        ratings: []
      };

      await recipesStore.addRecipe(newRecipe);

      // Redirect to recipe or dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      error = 'Failed to create recipe. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<Layout>
  {#snippet body()}
    <div class="create-recipe-page">
      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width: {(currentStep / 4) * 100}%"></div>
        </div>
        <div class="step-indicators">
          {#each Array(4) as _, i}
            <div class="step-indicator {i + 1 <= currentStep ? 'active' : ''}">
              {i + 1}
            </div>
          {/each}
        </div>
      </div>

      <!-- Step Content -->
      <div class="wizard-container">
        {#if error}
          <div class="error-message">
            {error}
          </div>
        {/if}

        <!-- Step 1: Basic Info -->
        {#if currentStep === 1}
          <div class="step-content">
            <h2>Basic Information</h2>
            <p>Tell us about your recipe</p>

            <div class="form-grid">
              <div class="form-group full-width">
                <label for="title">Recipe Title *</label>
                <input
                  id="title"
                  type="text"
                  bind:value={title}
                  placeholder="Enter recipe title"
                  class="form-input"
                />
              </div>

              <div class="form-group full-width">
                <label for="description">Description *</label>
                <textarea
                  id="description"
                  bind:value={description}
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
                  bind:value={servings}
                  min="1"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="prepTime">Prep Time (minutes) *</label>
                <input
                  id="prepTime"
                  type="number"
                  bind:value={prepTime}
                  min="0"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="cookTime">Cook Time (minutes) *</label>
                <input
                  id="cookTime"
                  type="number"
                  bind:value={cookTime}
                  min="0"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="difficulty">Difficulty *</label>
                <select id="difficulty" bind:value={difficulty} class="form-select">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div class="form-group">
                <label for="cuisine">Cuisine *</label>
                <select id="cuisine" bind:value={cuisine} class="form-select">
                  <option value="">Select cuisine</option>
                  {#each cuisineOptions as option}
                    <option value={option}>{option}</option>
                  {/each}
                </select>
              </div>

              <div class="form-group full-width">
                <label>Dietary Tags</label>
                <div class="tag-grid">
                  {#each dietaryOptions as tag}
                    <label class="tag-checkbox">
                      <input
                        type="checkbox"
                        checked={dietaryTags.includes(tag)}
                        onchange={() => toggleDietaryTag(tag)}
                      />
                      {tag}
                    </label>
                  {/each}
                </div>
              </div>
            </div>
          </div>

        <!-- Step 2: Ingredients -->
        {:else if currentStep === 2}
          <div class="step-content">
            <h2>Ingredients</h2>
            <p>Add all the ingredients needed for your recipe</p>

            <div class="ingredients-list">
              {#each ingredients as ingredient, index}
                <div class="ingredient-row">
                  <input
                    type="number"
                    bind:value={ingredient.quantity}
                    min="0"
                    step="0.25"
                    class="quantity-input"
                    placeholder="1"
                  />

                  <select bind:value={ingredient.unit} class="unit-select">
                    {#each unitOptions as unit}
                      <option value={unit}>{unit}</option>
                    {/each}
                  </select>

                  <input
                    type="text"
                    bind:value={ingredient.name}
                    placeholder="Ingredient name"
                    class="ingredient-input"
                  />

                  <input
                    type="text"
                    bind:value={ingredient.notes}
                    placeholder="Notes (optional)"
                    class="notes-input"
                  />

                  <button
                    type="button"
                    onclick={() => removeIngredient(index)}
                    class="remove-btn"
                    disabled={ingredients.length === 1}
                  >
                    ✕
                  </button>
                </div>
              {/each}
            </div>

            <button type="button" onclick={addIngredient} class="add-btn">
              ➕ Add Ingredient
            </button>
          </div>

        <!-- Step 3: Instructions -->
        {:else if currentStep === 3}
          <div class="step-content">
            <h2>Instructions</h2>
            <p>Break down your recipe into clear, step-by-step instructions</p>

            <div class="instructions-list">
              {#each instructions as instruction, index}
                <div class="instruction-row">
                  <div class="step-number">{instruction.step}</div>

                  <div class="instruction-content">
                    <textarea
                      bind:value={instruction.description}
                      placeholder="Describe this step..."
                      class="instruction-textarea"
                      rows="2"
                    ></textarea>

                    <div class="instruction-meta">
                      <label>
                        Duration (minutes):
                        <input
                          type="number"
                          bind:value={instruction.duration}
                          min="0"
                          class="duration-input"
                          placeholder="0"
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onclick={() => removeInstruction(index)}
                    class="remove-btn"
                    disabled={instructions.length === 1}
                  >
                    ✕
                  </button>
                </div>
              {/each}
            </div>

            <button type="button" onclick={addInstruction} class="add-btn">
              ➕ Add Step
            </button>
          </div>

        <!-- Step 4: Photos -->
        {:else if currentStep === 4}
          <div class="step-content">
            <h2>Photos</h2>
            <p>Add photos to make your recipe more appealing (optional)</p>

            <div class="image-upload-area">
              <input
                type="file"
                accept="image/*"
                multiple
                onchange={handleImageUpload}
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

            {#if images.length > 0}
              <div class="image-preview">
                <h4>Uploaded Images</h4>
                <div class="image-grid">
                  {#each images as image, index}
                    <div class="image-item">
                      <img src={image} alt="Recipe photo {index + 1}" />
                      <button
                        type="button"
                        onclick={() => removeImage(index)}
                        class="remove-image-btn"
                      >
                        ✕
                      </button>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Navigation Buttons -->
        <div class="wizard-navigation">
          <button
            type="button"
            onclick={prevStep}
            class="nav-btn secondary"
            disabled={currentStep === 1}
          >
            ← Previous
          </button>

          <div class="step-info">
            Step {currentStep} of 4
          </div>

          {#if currentStep < 4}
            <button
              type="button"
              onclick={nextStep}
              class="nav-btn primary"
              disabled={!isStepValid}
            >
              Next →
            </button>
          {:else}
            <button
              type="button"
              onclick={submitRecipe}
              class="nav-btn primary"
              disabled={!isStepValid || isLoading}
            >
              {#if isLoading}
                <span class="spinner"></span>
                Creating...
              {:else}
                Create Recipe
              {/if}
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/snippet}
</Layout>

<style>
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
