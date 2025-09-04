import type { Recipe, ApiError } from '../lib/api/types';

const sampleRecipes: Recipe[] = [
  {
    id: '1',
    title: 'Chicken Tikka Masala',
    description: 'Creamy and flavorful Indian curry with tender chicken pieces',
    servings: 4,
    prepTime: 30,
    cookTime: 45,
    difficulty: 'medium',
    cuisine: 'Indian',
    dietaryTags: ['gluten-free'],
    ingredients: [
      { name: 'Chicken breast', quantity: 1, unit: 'lb' },
      { name: 'Heavy cream', quantity: 1, unit: 'cup' },
      { name: 'Tomato sauce', quantity: 1, unit: 'cup' },
      { name: 'Garam masala', quantity: 2, unit: 'tsp' }
    ],
    instructions: [
      { step: 1, description: 'Cut chicken into bite-sized pieces', duration: 5 },
      { step: 2, description: 'Marinate chicken in yogurt and spices', duration: 20 },
      { step: 3, description: 'Cook chicken until golden brown', duration: 15 },
      { step: 4, description: 'Add sauce and simmer', duration: 20 }
    ],
    nutrition: { calories: 380, protein: 32, carbs: 12, fat: 24, fiber: 3, sugar: 8 },
    images: ['/_/images/chicken-tikka-masala.jpg'],
    author: 'Chef Priya',
    ratings: [5, 4, 5, 4, 5],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Spaghetti Carbonara',
    description: 'Classic Roman pasta dish with eggs, cheese, and pancetta',
    servings: 2,
    prepTime: 10,
    cookTime: 20,
    difficulty: 'easy',
    cuisine: 'Italian',
    dietaryTags: [],
    ingredients: [
      { name: 'Spaghetti', quantity: 8, unit: 'oz' },
      { name: 'Pancetta', quantity: 4, unit: 'oz' },
      { name: 'Eggs', quantity: 3, unit: 'large' },
      { name: 'Parmesan cheese', quantity: 1, unit: 'cup', notes: 'grated' }
    ],
    instructions: [
      { step: 1, description: 'Cook pasta according to package directions', duration: 10 },
      { step: 2, description: 'Cook pancetta until crispy', duration: 5 },
      { step: 3, description: 'Whisk eggs and cheese together', duration: 2 },
      { step: 4, description: 'Combine everything while pasta is hot', duration: 3 }
    ],
    nutrition: { calories: 520, protein: 28, carbs: 45, fat: 26, fiber: 2, sugar: 3 },
    images: ['/_/images/spaghetti-carbonara.jpg'],
    author: 'Chef Marco',
    ratings: [4, 5, 4, 4, 5],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '3',
    title: 'Beef Wellington',
    description: 'Elegant beef tenderloin wrapped in puff pastry with mushroom duxelles',
    servings: 6,
    prepTime: 60,
    cookTime: 120,
    difficulty: 'hard',
    cuisine: 'British',
    dietaryTags: [],
    ingredients: [
      { name: 'Beef tenderloin', quantity: 3, unit: 'lb' },
      { name: 'Puff pastry', quantity: 1, unit: 'sheet' },
      { name: 'Mushrooms', quantity: 1, unit: 'lb' },
      { name: 'Prosciutto', quantity: 8, unit: 'slices' }
    ],
    instructions: [
      { step: 1, description: 'Sear beef on all sides', duration: 10 },
      { step: 2, description: 'Prepare mushroom duxelles', duration: 30 },
      { step: 3, description: 'Wrap beef with prosciutto and mushrooms', duration: 15 },
      { step: 4, description: 'Wrap in puff pastry and bake', duration: 45 }
    ],
    nutrition: { calories: 680, protein: 45, carbs: 25, fat: 42, fiber: 2, sugar: 4 },
    images: ['/_/images/beef-wellington.jpg'],
    author: 'Chef Gordon',
    ratings: [5, 5, 4, 5, 5],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  }
];

let recipes = $state(sampleRecipes);

let state = $state({
  recipes: sampleRecipes,
  loading: false,
  error: null as ApiError | null,

  // Filters
  searchQuery: '',
  selectedCuisine: null as string | null,
  selectedDifficulty: null as string | null,
});

async function loadRecipes() {
  state.loading = true;
  state.error = null;

  // Mock API call - replace with real API when backend is ready
  await new Promise(resolve => setTimeout(resolve, 500));
  state.recipes = sampleRecipes;
  state.loading = false;

  // Real API call would be:
  // const { payload, error } = await api.recipes.list();
  // if (error) {
  //   state.error = error;
  // } else {
  //   state.recipes = payload || [];
  // }
  // state.loading = false;
}

function getAverageRating(recipe: Recipe): number {
  if (recipe.ratings.length === 0) return 0;
  return recipe.ratings.reduce((sum, rating) => sum + rating, 0) / recipe.ratings.length;
}

let filteredRecipes = $derived(() => {
  let filtered = state.recipes;

  if (state.searchQuery) {
    filtered = filtered.filter(recipe =>
      recipe.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(state.searchQuery.toLowerCase()))
    );
  }

  if (state.selectedCuisine) {
    filtered = filtered.filter(recipe => recipe.cuisine === state.selectedCuisine);
  }

  if (state.selectedDifficulty) {
    filtered = filtered.filter(recipe => recipe.difficulty === state.selectedDifficulty);
  }

  return filtered;
});

let featuredRecipes = $derived(() => {
  return recipes
    .sort((a, b) => {
      const avgRatingA = a.ratings.reduce((sum, r) => sum + r, 0) / a.ratings.length;
      const avgRatingB = b.ratings.reduce((sum, r) => sum + r, 0) / b.ratings.length;
      return avgRatingB - avgRatingA;
    })
    .slice(0, 3);
});

let cuisines = $derived(() => {
  return [...new Set(state.recipes.map(recipe => recipe.cuisine))].sort();
});

function setSearchQuery(query: string) {
  state.searchQuery = query;
}

function setCuisineFilter(cuisine: string | null) {
  state.selectedCuisine = cuisine;
}

function setDifficultyFilter(difficulty: string | null) {
  state.selectedDifficulty = difficulty;
}

function getRecipeById(id: string): Recipe | undefined {
  return state.recipes.find(recipe => recipe.id === id);
}

export const recipesStore = {
  get state() { return state; },

  get recipes() { return recipes; },
  // Computed
  get filteredRecipes() { return filteredRecipes; },
  get featuredRecipes() { return featuredRecipes; },
  get cuisines() { return cuisines; },

  // Actions
  setSearchQuery,
  setCuisineFilter,
  setDifficultyFilter,
  getRecipeById,
  getAverageRating,
  loadRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe
};

async function addRecipe(newRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) {
  state.loading = true;
  state.error = null;

  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000));
  const recipe: Recipe = {
    ...newRecipe,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  state.recipes = [...state.recipes, recipe];
  state.loading = false;

  // Real API call would be:
  // const { payload, error } = await api.recipes.create(newRecipe);
  // if (error) {
  //   state.error = error;
  // } else if (payload) {
  //   state.recipes = [...state.recipes, payload];
  // }
  // state.loading = false;
}

async function updateRecipe(id: string, updates: Partial<Recipe>) {
  state.loading = true;
  state.error = null;

  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 500));
  state.recipes = state.recipes.map(recipe =>
    recipe.id === id
      ? { ...recipe, ...updates, updatedAt: new Date() }
      : recipe
  );
  state.loading = false;

  // Real API call would be:
  // const { payload, error } = await api.recipes.update(id, updates);
  // if (error) {
  //   state.error = error;
  // } else if (payload) {
  //   state.recipes = state.recipes.map(r => r.id === id ? payload : r);
  // }
  // state.loading = false;
}

async function deleteRecipe(id: string) {
  state.loading = true;
  state.error = null;

  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 500));
  state.recipes = state.recipes.filter(recipe => recipe.id !== id);
  state.loading = false;

  // Real API call would be:
  // const { payload, error } = await api.recipes.delete(id);
  // if (error) {
  //   state.error = error;
  // } else {
  //   state.recipes = state.recipes.filter(r => r.id !== id);
  // }
  // state.loading = false;
}
