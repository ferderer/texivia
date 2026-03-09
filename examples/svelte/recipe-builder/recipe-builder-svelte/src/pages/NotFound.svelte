<script lang="ts">
  import Layout from '../components/layout/Layout.svelte';

  let searchQuery: string = $state('');

  function handleSearch() {
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  }

  // Popular suggestions
  let suggestions = [
    { title: 'Browse All Recipes', href: '/recipes', icon: '📖' },
    { title: 'Popular Recipes', href: '/recipes?sort=rating', icon: '⭐' },
    { title: 'Quick & Easy Meals', href: '/search?q=quick', icon: '⚡' },
    { title: 'Vegetarian Options', href: '/search?q=vegetarian', icon: '🥬' },
  ];
</script>

<Layout>
  {#snippet body()}
    <div class="not-found-page">
      <div class="not-found-container">
        <!-- 404 Illustration -->
        <div class="error-illustration">
          <div class="error-number">404</div>
          <div class="error-icon">🍽️</div>
        </div>

        <!-- Error Message -->
        <div class="error-content">
          <h1>Recipe Not Found</h1>
          <p>
            Oops! The page you're looking for seems to have gone missing.
            Maybe it's in the kitchen getting prepared?
          </p>
        </div>

        <!-- Search Section -->
        <div class="search-section">
          <h3>Looking for something specific?</h3>
          <div class="search-bar">
            <input
              type="text"
              placeholder="Search for recipes..."
              bind:value={searchQuery}
              onkeydown={(e) => e.key === 'Enter' && handleSearch()}
              class="search-input"
            />
            <button onclick={handleSearch} class="search-btn">
              Search
            </button>
          </div>
        </div>

        <!-- Suggestions -->
        <div class="suggestions-section">
          <h3>Or try one of these popular options:</h3>
          <div class="suggestions-grid">
            {#each suggestions as suggestion}
              <a href={suggestion.href} class="suggestion-card">
                <span class="suggestion-icon">{suggestion.icon}</span>
                <span class="suggestion-title">{suggestion.title}</span>
                <span class="suggestion-arrow">→</span>
              </a>
            {/each}
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="navigation-links">
          <a href="/" class="nav-link primary">
            🏠 Go Home
          </a>
          <button onclick={() => window.history.back()} class="nav-link secondary">
            ← Go Back
          </button>
        </div>

        <!-- Help Text -->
        <div class="help-section">
          <p>
            <strong>Still can't find what you're looking for?</strong>
          </p>
          <p>
            Try browsing our <a href="/recipes">recipe collection</a> or
            <a href="/create">create your own recipe</a> to share with the community!
          </p>
        </div>
      </div>
    </div>
  {/snippet}
</Layout>

<style>
  .not-found-page {
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .not-found-container {
    max-width: 600px;
    width: 100%;
    text-align: center;
  }

  .error-illustration {
    position: relative;
    margin-bottom: 3rem;
  }

  .error-number {
    font-size: 8rem;
    font-weight: 900;
    color: #e5e7eb;
    line-height: 1;
    margin-bottom: -2rem;
  }

  .error-icon {
    font-size: 4rem;
    position: relative;
    z-index: 1;
  }

  .error-content {
    margin-bottom: 3rem;
  }

  .error-content h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #1f2937;
  }

  .error-content p {
    font-size: 1.125rem;
    color: #6b7280;
    line-height: 1.6;
    max-width: 500px;
    margin: 0 auto;
  }

  .search-section {
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    margin-bottom: 2rem;
  }

  .search-section h3 {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
    color: #374151;
  }

  .search-bar {
    display: flex;
    gap: 0.5rem;
    max-width: 400px;
    margin: 0 auto;
  }

  .search-input {
    flex: 1;
    padding: 0.875rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .search-btn {
    padding: 0.875rem 1.5rem;
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

  .suggestions-section {
    margin-bottom: 3rem;
  }

  .suggestions-section h3 {
    font-size: 1.125rem;
    margin-bottom: 1.5rem;
    color: #374151;
  }

  .suggestions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .suggestion-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    text-decoration: none;
    color: #374151;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  .suggestion-card:hover {
    border-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  .suggestion-icon {
    font-size: 1.5rem;
  }

  .suggestion-title {
    flex: 1;
    font-weight: 500;
    text-align: left;
  }

  .suggestion-arrow {
    color: #9ca3af;
    font-weight: 600;
  }

  .navigation-links {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 3rem;
  }

  .nav-link {
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-weight: 600;
    text-decoration: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-link.primary {
    background: #2563eb;
    color: white;
  }

  .nav-link.primary:hover {
    background: #1d4ed8;
  }

  .nav-link.secondary {
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
  }

  .nav-link.secondary:hover {
    border-color: #d1d5db;
    background: #f9fafb;
  }

  .help-section {
    padding: 2rem;
    background: #f8fafc;
    border-radius: 0.75rem;
    border: 1px solid #e2e8f0;
  }

  .help-section p {
    color: #475569;
    margin-bottom: 0.5rem;
    line-height: 1.6;
  }

  .help-section p:last-child {
    margin-bottom: 0;
  }

  .help-section a {
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
  }

  .help-section a:hover {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .error-number {
      font-size: 6rem;
    }

    .error-content h1 {
      font-size: 2rem;
    }

    .search-bar {
      flex-direction: column;
    }

    .suggestions-grid {
      grid-template-columns: 1fr;
    }

    .navigation-links {
      flex-direction: column;
      align-items: center;
    }

    .nav-link {
      width: 200px;
      justify-content: center;
    }
  }
</style>
