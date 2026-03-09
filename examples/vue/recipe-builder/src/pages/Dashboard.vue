<script setup lang="ts">
import { computed } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { recipesStore } from '../stores/recipes'

const user = {
  name: 'John Doe',
  email: 'john@example.com',
  joinDate: new Date('2024-01-01'),
  avatar: '/_/images/avatar-placeholder.jpg'
}

const userRecipes = computed(() => recipesStore.recipes.filter(r => r.author === user.name))
const totalRecipes = computed(() => userRecipes.value.length)
const totalViews = computed(() => userRecipes.value.reduce((sum, r) => sum + (r.ratings.length * 10), 0))
const averageRating = computed(() =>
  userRecipes.value.length > 0
    ? userRecipes.value.reduce((sum, r) => sum + (r.ratings.reduce((s, rating) => s + rating, 0) / r.ratings.length), 0) / userRecipes.value.length
    : 0
)

const recentRecipes = computed(() =>
  [...userRecipes.value]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)
)

const popularRecipes = computed(() =>
  [...userRecipes.value]
    .sort((a, b) => {
      const avgA = a.ratings.reduce((sum, r) => sum + r, 0) / a.ratings.length
      const avgB = b.ratings.reduce((sum, r) => sum + r, 0) / b.ratings.length
      return avgB - avgA
    })
    .slice(0, 3)
)

const quickActions = [
  { title: 'Create New Recipe', href: '/create', icon: '➕' },
  { title: 'Browse Recipes', href: '/recipes', icon: '🔍' },
  { title: 'Meal Planner', href: '/meal-planner', icon: '📅' },
  { title: 'Shopping List', href: '/shopping-list', icon: '🛒' }
]

const recentActivity = [
  { type: 'recipe_created', message: 'You created "Chicken Tikka Masala"', time: '2 hours ago' },
  { type: 'recipe_rated', message: 'Your "Spaghetti Carbonara" received a 5-star rating', time: '1 day ago' },
  { type: 'recipe_viewed', message: 'Your "Beef Wellington" was viewed 25 times', time: '2 days ago' },
  { type: 'recipe_saved', message: 'Someone saved your "Chicken Tikka Masala"', time: '3 days ago' }
]

const activityIcons: Record<string, string> = {
  recipe_created: '📝',
  recipe_rated: '⭐',
  recipe_viewed: '👁️',
  recipe_saved: '❤️'
}
</script>

<template>
  <AppLayout>
    <div class="dashboard">
      <!-- Dashboard Header -->
      <div class="dashboard-header">
        <div class="user-info">
          <img :src="user.avatar" :alt="user.name" class="user-avatar" />
          <div>
            <h1>Welcome back, {{ user.name }}!</h1>
            <p>Member since {{ user.joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}</p>
          </div>
        </div>

        <div class="header-actions">
          <a href="/create" class="btn-primary">➕ Create Recipe</a>
          <a href="/profile" class="btn-secondary">⚙️ Settings</a>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon recipes">📝</div>
          <div class="stat-content">
            <h3>{{ totalRecipes }}</h3>
            <p>Total Recipes</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon views">👁️</div>
          <div class="stat-content">
            <h3>{{ totalViews.toLocaleString() }}</h3>
            <p>Total Views</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rating">⭐</div>
          <div class="stat-content">
            <h3>{{ averageRating.toFixed(1) }}</h3>
            <p>Average Rating</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon saves">❤️</div>
          <div class="stat-content">
            <h3>127</h3>
            <p>Recipe Saves</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <a v-for="action in quickActions" :key="action.title" :href="action.href" class="action-card">
            <div class="action-icon">{{ action.icon }}</div>
            <span>{{ action.title }}</span>
          </a>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Recent Recipes -->
        <section class="content-section">
          <div class="section-header">
            <h2>Recent Recipes</h2>
            <a href="/my-recipes" class="view-all">View All →</a>
          </div>

          <div class="recipes-list">
            <template v-if="recentRecipes.length > 0">
              <div v-for="recipe in recentRecipes" :key="recipe.id" class="recipe-item">
                <img :src="recipe.images[0] || '/_/images/placeholder-recipe.jpg'" :alt="recipe.title" />
                <div class="recipe-info">
                  <h4><a :href="`/recipe/${recipe.id}`">{{ recipe.title }}</a></h4>
                  <p>{{ recipe.description }}</p>
                  <div class="recipe-meta">
                    <span>⭐ {{ (recipe.ratings.reduce((sum: number, r: number) => sum + r, 0) / recipe.ratings.length).toFixed(1) }}</span>
                    <span>👁️ {{ recipe.ratings.length * 10 }}</span>
                    <span>🕒 {{ recipe.cookTime }}min</span>
                  </div>
                </div>
                <div class="recipe-actions">
                  <a :href="`/recipe/${recipe.id}/edit`" class="edit-btn">Edit</a>
                </div>
              </div>
            </template>
            <div v-else class="empty-state">
              <p>No recipes yet</p>
              <a href="/create" class="btn-primary">Create Your First Recipe</a>
            </div>
          </div>
        </section>

        <!-- Popular Recipes -->
        <section class="content-section">
          <div class="section-header">
            <h2>Your Popular Recipes</h2>
          </div>

          <div class="popular-list">
            <template v-if="popularRecipes.length > 0">
              <div v-for="(recipe, index) in popularRecipes" :key="recipe.id" class="popular-item">
                <div class="rank">#{{ index + 1 }}</div>
                <img :src="recipe.images[0] || '/_/images/placeholder-recipe.jpg'" :alt="recipe.title" />
                <div class="popular-info">
                  <h4><a :href="`/recipe/${recipe.id}`">{{ recipe.title }}</a></h4>
                  <div class="popular-stats">
                    <span>⭐ {{ (recipe.ratings.reduce((sum: number, r: number) => sum + r, 0) / recipe.ratings.length).toFixed(1) }}</span>
                    <span>👁️ {{ recipe.ratings.length * 10 }}</span>
                  </div>
                </div>
              </div>
            </template>
            <div v-else class="empty-state">
              <p>Create some recipes to see your popular ones here!</p>
            </div>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="content-section activity">
          <div class="section-header">
            <h2>Recent Activity</h2>
          </div>

          <div class="activity-list">
            <div v-for="(activity, index) in recentActivity" :key="index" class="activity-item">
              <div :class="['activity-icon', activity.type]">
                {{ activityIcons[activity.type] }}
              </div>
              <div class="activity-content">
                <p>{{ activity.message }}</p>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e5e7eb;
}

.user-info h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
  color: #1f2937;
}

.user-info p {
  color: #6b7280;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  display: inline-block;
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
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.recipes { background: #dbeafe; }
.stat-icon.views { background: #dcfce7; }
.stat-icon.rating { background: #fef3c7; }
.stat-icon.saves { background: #fce7f3; }

.stat-content h3 {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-content p {
  color: #6b7280;
  font-size: 0.875rem;
}

.quick-actions {
  margin-bottom: 3rem;
}

.quick-actions h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  text-decoration: none;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 1.5rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.content-section {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.content-section.activity {
  grid-column: 1 / -1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  color: #1f2937;
}

.view-all {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.875rem;
}

.recipes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipe-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.recipe-item:hover {
  border-color: #e5e7eb;
  background: #f9fafb;
}

.recipe-item img {
  width: 4rem;
  height: 4rem;
  border-radius: 0.5rem;
  object-fit: cover;
  flex-shrink: 0;
}

.recipe-info {
  flex: 1;
}

.recipe-info h4 {
  margin-bottom: 0.5rem;
}

.recipe-info h4 a {
  color: #1f2937;
  text-decoration: none;
  font-weight: 600;
}

.recipe-info h4 a:hover {
  color: #2563eb;
}

.recipe-info p {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.recipe-actions {
  display: flex;
  align-items: center;
}

.edit-btn {
  color: #2563eb;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.edit-btn:hover {
  background: #f3f4f6;
}

.popular-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.popular-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #f3f4f6;
  border-radius: 0.5rem;
}

.rank {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2563eb;
  min-width: 2rem;
}

.popular-item img {
  width: 3rem;
  height: 3rem;
  border-radius: 0.375rem;
  object-fit: cover;
}

.popular-info {
  flex: 1;
}

.popular-info h4 {
  margin-bottom: 0.25rem;
}

.popular-info h4 a {
  color: #1f2937;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
}

.popular-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-left: 3px solid #e5e7eb;
  border-radius: 0 0.5rem 0.5rem 0;
  background: #f9fafb;
}

.activity-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.activity-icon.recipe_created { background: #dbeafe; }
.activity-icon.recipe_rated { background: #fef3c7; }
.activity-icon.recipe_viewed { background: #dcfce7; }
.activity-icon.recipe_saved { background: #fce7f3; }

.activity-content p {
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: #9ca3af;
  font-size: 0.75rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.empty-state p {
  margin-bottom: 1rem;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
  }

  .header-actions {
    align-self: stretch;
    justify-content: space-between;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
