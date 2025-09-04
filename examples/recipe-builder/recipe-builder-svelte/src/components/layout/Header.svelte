<header class="header">
  <div class="container">
    <div class="nav-brand">
      <a href="/" class="logo">Recipe Builder</a>
    </div>

    <nav class="nav-desktop">
      <a href="/recipes">Recipes</a>
      <a href="/search">Search</a>
      <a href="/dashboard">Dashboard</a>
    </nav>

    <div class="nav-actions">
      <button class="search-btn">🔍</button>
      <a href="/login">Login</a>
      <label class="menu-toggle">
        <input type="checkbox" />
        <span>☰</span>
        <div class="mobile-menu">
          <a href="/recipes">Recipes</a>
          <a href="/search">Search</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/create">Create Recipe</a>
          <a href="/login">Login</a>
        </div>
      </label>
    </div>
  </div>
</header>

<style>
  .header {
    background: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 4rem;
  }

  .logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2563eb;
    text-decoration: none;
  }

  .nav-desktop {
    display: flex;
    gap: 2rem;
  }

  .nav-desktop a {
    color: #374151;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }

  .nav-desktop a:hover {
    background-color: #f3f4f6;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav-actions a {
    color: #374151;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }

  .nav-actions a:hover {
    background-color: #f3f4f6;
  }

  .search-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
  }

  .menu-toggle {
    display: none;
    position: relative;
  }

  .menu-toggle input {
    display: none;
  }

  .menu-toggle span {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.5rem;
    display: block;
  }

  .mobile-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    display: none;
    flex-direction: column;
    gap: 0;
    z-index: 1000;
  }

  .menu-toggle input:checked + span + .mobile-menu {
    display: flex;
  }

  .mobile-menu a {
    text-align: left;
    padding: 0.75rem 1rem;
    color: #374151;
    text-decoration: none;
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.2s;
  }

  .mobile-menu a:last-child {
    border-bottom: none;
  }

  .mobile-menu a:hover {
    background-color: #f9fafb;
  }

  @media (max-width: 768px) {
    .nav-desktop {
      display: none;
    }

    .menu-toggle {
      display: block;
    }
  }
</style>
