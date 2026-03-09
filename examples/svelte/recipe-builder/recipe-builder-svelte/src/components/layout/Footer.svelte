<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <h3>Recipe Builder</h3>
        <p>Discover, create, and share amazing recipes</p>
      </div>

      <div class="footer-section">
        <h4>Features</h4>
        <ul>
          <li><a href="/recipes">Browse Recipes</a></li>
          <li><a href="/meal-planner">Meal Planning</a></li>
          <li><a href="/shopping-list">Shopping Lists</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>Account</h4>
        <ul>
          <li><a href="/login">Sign In</a></li>
          <li><a href="/register">Sign Up</a></li>
          <li><a href="/profile">Profile</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; 2025 Recipe Builder. All rights reserved.</p>
    </div>
  </div>
</footer>

<style>
  .footer {
    background-color: #1f2937;
    color: white;
    margin-top: auto;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem 1rem;
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .footer-section h3 {
    color: #2563eb;
    margin-bottom: 1rem;
  }

  .footer-section h4 {
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .footer-section ul {
    list-style: none;
    padding: 0;
  }

  .footer-section li {
    margin-bottom: 0.5rem;
  }

  .footer-section a {
    color: #d1d5db;
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-section a:hover {
    color: white;
  }

  .footer-bottom {
    border-top: 1px solid #374151;
    padding-top: 1rem;
    text-align: center;
    color: #9ca3af;
  }
</style>