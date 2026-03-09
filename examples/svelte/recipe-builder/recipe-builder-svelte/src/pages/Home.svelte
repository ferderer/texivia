<script lang="ts">
  import { onMount } from 'svelte';
  import Layout from '../components/layout/Layout.svelte';
  import { recipesStore } from '../stores/recipes.svelte.js';

  let searchQuery = $state('');

  const categories = [
    { name: 'Quick & Easy', icon: '⚡', count: 127 },
    { name: 'Vegetarian', icon: '🥬', count: 89 },
    { name: 'Desserts', icon: '🍰', count: 64 },
    { name: 'Italian', icon: '🍝', count: 52 },
    { name: 'Healthy', icon: '💚', count: 98 },
    { name: 'Comfort Food', icon: '🍲', count: 73 },
  ];
  function handleSearch() {
    if (searchQuery.trim()) {
      recipesStore.setSearchQuery(searchQuery);
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  }

  onMount(() => {
    recipesStore.loadRecipes();
  });
</script>

<Layout>
  {#snippet body()}
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1>Discover Your Next Favorite Recipe</h1>
        <p>Join thousands of home cooks sharing and discovering amazing recipes</p>

        <div class="search-bar">
          <input
            type="text"
            placeholder="Search for recipes, ingredients, or cuisines..."
            bind:value={searchQuery}
            onkeydown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button class="search-btn" onclick={handleSearch}>Search</button>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">{recipesStore.recipes.length}</span>
            <span class="stat-label">Recipes</span>
          </div>
          <div class="stat">
            <span class="stat-number">5K+</span>
            <span class="stat-label">Home Cooks</span>
          </div>
          <div class="stat">
            <span class="stat-number">50K+</span>
            <span class="stat-label">Reviews</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories">
      <h2>Browse by Category</h2>
      <div class="category-grid">
        {#each categories as category}
          <a href="/recipes?category={category.name.toLowerCase()}" class="category-card">
            <span class="category-icon">{category.icon}</span>
            <span class="category-name">{category.name}</span>
            <span class="category-count">{category.count} recipes</span>
          </a>
        {/each}
      </div>
    </section>

    <!-- Featured Recipes -->
    <section class="featured">
      <div class="section-header">
        <h2>Featured Recipes</h2>
        <a href="/recipes" class="view-all">View All →</a>
      </div>

      <div class="recipe-grid">
        {#each recipesStore.recipes as recipe}
          <a href="/recipe/{recipe.id}" class="recipe-card">
            <div class="recipe-image">
              <img src={recipe.images[0] || '/_/images/placeholder-recipe.jpg'} alt={recipe.title} />
              <div class="recipe-difficulty">{recipe.difficulty}</div>
            </div>
            <div class="recipe-info">
              <h3>{recipe.title}</h3>
              <div class="recipe-meta">
                <span class="cook-time">🕒 {recipe.cookTime}min</span>
                <span class="rating">⭐ {recipesStore.getAverageRating(recipe).toFixed(1)}</span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-content">
        <h2>Ready to Start Cooking?</h2>
        <p>Join our community and start sharing your own recipes</p>
        <div class="cta-buttons">
          <a href="/register" class="btn btn-primary">Sign Up Free</a>
          <a href="/create" class="btn btn-secondary">Create Recipe</a>
        </div>
      </div>
    </section>
  {/snippet}
</Layout>

<style>
  .hero {
    text-align: center;
    padding: 4rem 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 1rem;
    margin-bottom: 3rem;
  }

  .hero-content h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-weight: bold;
  }

  .hero-content p {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }

  .search-bar {
    display: flex;
    max-width: 500px;
    margin: 0 auto 2rem;
    gap: 0.5rem;
  }

  .search-bar input {
    flex: 1;
    padding: 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
  }

  .search-btn {
    padding: 1rem 2rem;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .search-btn:hover {
    background: #1d4ed8;
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 3rem;
    margin-top: 2rem;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: bold;
  }

  .stat-label {
    opacity: 0.8;
    font-size: 0.9rem;
  }

  .categories {
    margin-bottom: 3rem;
  }

  .categories h2 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2rem;
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .category-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    text-decoration: none;
    color: inherit;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }

  .category-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .category-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .category-name {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .category-count {
    color: #6b7280;
    font-size: 0.9rem;
  }

  .featured {
    margin-bottom: 3rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .view-all {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }

  .recipe-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
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

  .recipe-image {
    position: relative;
    height: 200px;
    overflow: hidden;
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
  }

  .recipe-info {
    padding: 1.5rem;
  }

  .recipe-info h3 {
    margin-bottom: 1rem;
    font-size: 1.25rem;
  }

  .recipe-meta {
    display: flex;
    justify-content: space-between;
    color: #6b7280;
    font-size: 0.9rem;
  }

  .cta {
    text-align: center;
    padding: 4rem 2rem;
    background: #f9fafb;
    border-radius: 1rem;
  }

  .cta h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .cta p {
    font-size: 1.125rem;
    color: #6b7280;
    margin-bottom: 2rem;
  }

  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .btn {
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.2s;
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

  @media (max-width: 768px) {
    .hero-content h1 {
      font-size: 2rem;
    }

    .hero-stats {
      gap: 1.5rem;
    }

    .search-bar {
      flex-direction: column;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }

    .btn {
      width: 200px;
    }
  }
</style>
