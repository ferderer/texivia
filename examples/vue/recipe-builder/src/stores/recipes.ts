import { reactive, computed } from 'vue';
import { api } from '../lib/api';
import { averageRating } from '../lib/rating';
import type { ApiError, NewRecipe, Recipe } from '../lib/api/types';

export type { Recipe, Ingredient, Instruction, NewRecipe } from '../lib/api/types';

// The recipes live on the server (examples/recipe-api/API.md). `error` is the last failed load;
// the actions return their error to the caller instead, so a form can show it next to the fields.
const state = reactive({
  recipes: [] as Recipe[],
  loading: false,
  loaded: false,
  error: null as ApiError | null,
  searchQuery: '',
  selectedCuisine: null as string | null,
  selectedDifficulty: null as string | null,
});

let loadController: AbortController | null = null;

/** (Re)loads all recipes. A newer call cancels the one still running. */
async function loadRecipes(): Promise<boolean> {
  loadController?.abort();
  const controller = (loadController = new AbortController());
  state.loading = true;
  state.error = null;

  const { payload, error } = await api.recipes.list(controller.signal);
  if (controller.signal.aborted) return false; // superseded, the newer call owns `loading`

  state.loading = false;
  if (error) {
    state.error = error;
    return false;
  }
  state.recipes = payload ?? [];
  state.loaded = true;
  return true;
}

/** Loads the recipes once; pages that list recipes call this when they open. */
function ensureLoaded(): Promise<boolean> | undefined {
  if (!state.loaded && !state.loading) return loadRecipes();
}

/** Loads one recipe (for a deep link to a detail page) and puts it into the list. */
async function loadRecipe(id: string): Promise<ApiError | null> {
  const { payload, error } = await api.recipes.show(id);
  if (error) return error;
  const recipe = payload as Recipe;
  state.recipes = state.recipes.some((r) => r.id === recipe.id)
    ? state.recipes.map((r) => (r.id === recipe.id ? recipe : r))
    : [...state.recipes, recipe];
  return null;
}

async function addRecipe(newRecipe: NewRecipe): Promise<ApiError | null> {
  const { payload, error } = await api.recipes.create(newRecipe);
  if (error) return error;
  state.recipes = [...state.recipes, payload as Recipe];
  return null;
}

async function updateRecipe(id: string, updates: Partial<NewRecipe>): Promise<ApiError | null> {
  const { payload, error } = await api.recipes.update(id, updates);
  if (error) return error;
  state.recipes = state.recipes.map((r) => (r.id === id ? (payload as Recipe) : r));
  return null;
}

async function deleteRecipe(id: string): Promise<ApiError | null> {
  const { error } = await api.recipes.delete(id);
  if (error) return error;
  state.recipes = state.recipes.filter((r) => r.id !== id);
  return null;
}

const filteredRecipes = computed(() => {
  let filtered = state.recipes;

  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(recipe =>
      recipe.title.toLowerCase().includes(query) ||
      recipe.description.toLowerCase().includes(query) ||
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(query))
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

const featuredRecipes = computed(() =>
  [...state.recipes].sort((a, b) => averageRating(b) - averageRating(a)).slice(0, 3)
);

const cuisines = computed(() => [...new Set(state.recipes.map(recipe => recipe.cuisine))].sort());

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
  get recipes() { return state.recipes; },
  get filteredRecipes() { return filteredRecipes.value; },
  get featuredRecipes() { return featuredRecipes.value; },
  get cuisines() { return cuisines.value; },

  setSearchQuery,
  setCuisineFilter,
  setDifficultyFilter,
  getRecipeById,
  getAverageRating: averageRating,
  loadRecipes,
  ensureLoaded,
  loadRecipe,
  addRecipe,
  updateRecipe,
  deleteRecipe
};
