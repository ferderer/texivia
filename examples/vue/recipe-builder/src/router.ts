import { Router } from 'texivia-router';
import type { Component } from 'vue';

// Public pages
import Home from './pages/Home.vue';
import Recipes from './pages/Recipes.vue';
import RecipeDetail from './pages/RecipeDetail.vue';
import Search from './pages/Search.vue';
import Login from './pages/Login.vue';
import Register from './pages/Register.vue';
import ForgotPassword from './pages/ForgotPassword.vue';

// Protected pages
import Dashboard from './pages/Dashboard.vue';
import CreateRecipe from './pages/CreateRecipe.vue';
import NotFound from './pages/NotFound.vue';

export const router = new Router<Component>([
  // Public routes
  { path: '/', view: Home },
  { path: '/recipes', view: Recipes },
  { path: '/recipe/{id}', view: RecipeDetail },
  { path: '/search', view: Search },

  // Auth routes
  { path: '/login', view: Login },
  { path: '/register', view: Register },
  { path: '/forgot-password', view: ForgotPassword },

  // Protected routes
  { path: '/dashboard', view: Dashboard },
  { path: '/create', view: CreateRecipe },

  // Catch-all
  { path: '*', view: NotFound },
]);
