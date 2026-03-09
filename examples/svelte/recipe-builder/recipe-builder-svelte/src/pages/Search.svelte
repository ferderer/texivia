<script lang="ts">
  import { onMount } from 'svelte';
  import Layout from '../components/layout/Layout.svelte';
  import { recipesStore } from '../stores/recipes.svelte.js';

  let searchQuery: string = $state('');
  let selectedCuisine: string = $state('');
  let selectedDifficulty: string = $state('');
  let maxCookTime: number = $state(0);
  let sortBy: 'relevance' | 'rating' | 'cookTime' | 'title' = $state('relevance');
  let viewMode: 'grid' | 'list' = $state('grid');

  // Get unique values for filters
  let cuisines = $derived([...new Set(recipesStore.recipes.map(r => r.cuisine))].sort());
  let difficulties = $derived([...new Set(recipesStore.recipes.map(r => r.difficulty))]);
  let maxAvailableCookTime = $derived(Math.max(...recipesStore.recipes.map(r => r.cookTime)));

  // Search and filter recipes
  let searchResults = $derived(recipesStore.recipes
    .filter(recipe => {
      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          recipe.title.toLowerCase().includes(query) ||
          recipe.description.toLowerCase().includes(query) ||
          recipe.cuisine.toLowerCase().includes(query) ||
          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query)) ||
          recipe.dietaryTags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .filter(recipe => !selectedCuisine || recipe.cuisine === selectedCuisine)
    .filter(recipe => !selectedDifficulty || recipe.difficulty === selectedDifficulty)
    .filter(recipe => !maxCookTime || recipe.cookTime <= maxCookTime)
    .sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          // Simple relevance: title matches first, then description
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const aInTitle = a.title.toLowerCase().includes(query) ? 1 : 0;
            const bInTitle = b.title.toLowerCase().includes(query) ? 1 : 0;
            if (aInTitle !== bInTitle) return bInTitle - aInTitle;
          }
          return 0;
        case 'rating':
          const avgA = a.ratings.reduce((sum, r) => sum + r, 0) / a.ratings.length;
          const avgB = b.ratings.reduce((sum, r) => sum + r, 0) / b.ratings.length;
          return avgB - avgA;
        case 'cookTime':
          return a.cookTime - b.cookTime;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    }));

  function clearFilters() {
    searchQuery = '';
    selectedCuisine = '';
    selectedDifficulty = '';
    maxCookTime = 0;
    sortBy = 'relevance';
  }

  function updateSearchFromURL() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      searchQuery = q;
    }
  }

  onMount(() => {
    updateSearchFromURL();
  });
</script>

<Layout>
  {#snippet body()}
    <div class="search-page">
      <!-- Search Header -->
      <div class="search-header">
        <h1>Search Recipes</h1>
        <div class="main-search">
          <input
            type="text"
            placeholder="Search for recipes, ingredients, cuisines..."
            bind:value={searchQuery}
            class="search-input"
          />
          <button class="search-btn">🔍</button>
        </div>
      </div>

      <div class="search-layout">
        <!-- Filters Sidebar -->
        <aside class="filters-sidebar">
          <h3>Filters</h3>

          <div class="filter-group">
            <label>Cuisine</label>
            <select bind:value={selectedCuisine} class="filter-select">
              <option value="">All Cuisines</option>
              {#each cuisines as cuisine}
                <option value={cuisine}>{cuisine}</option>
              {/each}
            </select>
          </div>

          <div class="filter-group">
            <label>Difficulty</label>
            <select bind:value={selectedDifficulty} class="filter-select">
              <option value="">All Difficulties</option>
              {#each difficulties as difficulty}
                <option value={difficulty}>{difficulty}</option>
              {/each}
            </select>
          </div>

          <div class="filter-group">
            <label>Max Cook Time: {maxCookTime || 'Any'} {maxCookTime ? 'min' : ''}</label>
            <input
              type="range"
              min="0"
              max={maxAvailableCookTime}
              step="15"
              bind:value={maxCookTime}
              class="time-slider"
            />
            <div class="slider-labels">
              <span>0 min</span>
              <span>{maxAvailableCookTime} min</span>
            </div>
          </div>

          <button onclick={clearFilters} class="clear-filters">
            Clear All Filters
          </button>
        </aside>

        <!-- Results Area -->
        <main class="results-area">
          <!-- Results Controls -->
          <div class="results-controls">
            <div class="results-info">
              {#if searchQuery}
                <p>Results for "<strong>{searchQuery}</strong>" ({searchResults.length} found)</p>
              {:else}
                <p>Showing {searchResults.length} recipes</p>
              {/if}
            </div>

            <div class="controls-right">
              <select bind:value={sortBy} class="sort-select">
                <option value="relevance">Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="cookTime">Shortest Cook Time</option>
                <option value="title">Alphabetical</option>
              </select>

              <div class="view-controls">
                <button
                  class="view-btn {viewMode === 'grid' ? 'active' : ''}"
                  onclick={() => viewMode = 'grid'}
                >
                  ⊞
                </button>
                <button
                  class="view-btn {viewMode === 'list' ? 'active' : ''}"
                  onclick={() => viewMode = 'list'}
                >
                  ☰
                </button>
              </div>
            </div>
          </div>

          <!-- Search Results -->
          <div class="search-results {viewMode}">
            {#each searchResults as recipe (recipe.id)}
              <a href="/recipe/{recipe.id}" class="result-card {viewMode}">
                <div class="result-image">
                  <img src={recipe.images[0] || '/_/images/placeholder-recipe.jpg'} alt={recipe.title} />
                  <div class="result-difficulty">{recipe.difficulty}</div>
                </div>
                <div class="result-info">
                  <h3>{recipe.title}</h3>
                  <p class="result-description">{recipe.description}</p>
                  <div class="result-meta">
                    <span class="cuisine">{recipe.cuisine}</span>
                    <span class="cook-time">🕒 {recipe.cookTime}min</span>
                    <span class="rating">⭐ {(recipe.ratings.reduce((sum, r) => sum + r, 0) / recipe.ratings.length).toFixed(1)}</span>
                  </div>
                  {#if recipe.dietaryTags.length > 0}
                    <div class="dietary-tags">
                      {#each recipe.dietaryTags as tag}
                        <span class="tag">{tag}</span>
                      {/each}
                    </div>
                  {/if}
                </div>
              </a>
            {:else}
              <div class="no-results">
                <h3>No recipes found</h3>
                {#if searchQuery || selectedCuisine || selectedDifficulty || maxCookTime}
                  <p>Try adjusting your search terms or filters</p>
                  <button onclick={clearFilters} class="btn-primary">Clear Filters</button>
                {:else}
                  <p>Start by searching for recipes, ingredients, or cuisines</p>
                {/if}
              </div>
            {/each}
          </div>
        </main>
      </div>
    </div>
  {/snippet}
</Layout>

<style>
  .search-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .search-header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .search-header h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: #1f2937;
  }

  .main-search {
    display: flex;
    max-width: 600px;
    margin: 0 auto;
    gap: 0.5rem;
  }

  .search-input {
    flex: 1;
    padding: 1rem 1.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.75rem;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #2563eb;
  }

  .search-btn {
    padding: 1rem 1.5rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    font-size: 1.25rem;
    transition: background 0.2s;
  }

  .search-btn:hover {
    background: #1d4ed8;
  }

  .search-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 2rem;
  }

  .filters-sidebar {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    height: fit-content;
    position: sticky;
    top: 2rem;
  }

  .filters-sidebar h3 {
    margin-bottom: 1.5rem;
    color: #1f2937;
    font-size: 1.25rem;
  }

  .filter-group {
    margin-bottom: 2rem;
  }

  .filter-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }

  .filter-select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background: white;
    font-size: 0.9rem;
  }

  .time-slider {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .clear-filters {
    width: 100%;
    padding: 0.75rem;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  }

  .clear-filters:hover {
    background: #e5e7eb;
  }

  .results-area {
    min-height: 60vh;
  }

  .results-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 0.75rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .results-info p {
    color: #6b7280;
    margin: 0;
  }

  .controls-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .sort-select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: white;
    font-size: 0.875rem;
  }

  .view-controls {
    display: flex;
    gap: 0.25rem;
  }

  .view-btn {
    width: 2.5rem;
    height: 2.5rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 0.375rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .view-btn.active {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }

  .view-btn:hover:not(.active) {
    background: #f3f4f6;
  }

  .search-results.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
  }

  .search-results.list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .result-card {
    background: white;
    border-radius: 0.75rem;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    transition: all 0.2s;
  }

  .result-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .result-card.grid {
    display: flex;
    flex-direction: column;
  }

  .result-card.list {
    display: flex;
    flex-direction: row;
  }

  .result-image {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .result-card.list .result-image {
    width: 250px;
    height: 150px;
    flex-shrink: 0;
  }

  .result-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .result-difficulty {
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

  .result-info {
    padding: 1.5rem;
    flex: 1;
  }

  .result-card.list .result-info {
    padding: 1rem 1.5rem;
  }

  .result-info h3 {
    margin-bottom: 0.75rem;
    font-size: 1.25rem;
    color: #1f2937;
  }

  .result-description {
    color: #6b7280;
    margin-bottom: 1rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .result-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .cuisine {
    background: #f3f4f6;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: 500;
  }

  .dietary-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .tag {
    background: #dbeafe;
    color: #2563eb;
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
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

  @media (max-width: 1024px) {
    .search-layout {
      grid-template-columns: 1fr;
    }

    .filters-sidebar {
      position: static;
      order: 2;
    }

    .results-area {
      order: 1;
    }
  }

  @media (max-width: 768px) {
    .main-search {
      flex-direction: column;
    }

    .results-controls {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .controls-right {
      justify-content: space-between;
    }

    .search-results.grid {
      grid-template-columns: 1fr;
    }

    .result-card.list {
      flex-direction: column;
    }

    .result-card.list .result-image {
      width: 100%;
      height: 200px;
    }

    .filter-group {
      margin-bottom: 1.5rem;
    }
  }
</style>
