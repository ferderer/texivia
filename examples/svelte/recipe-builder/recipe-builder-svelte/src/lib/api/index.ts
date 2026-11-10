import { apiFetch } from 'texivia-fetch';
import { API } from './endpoints';
import type { NewRecipe, Recipe, RecipeSearch } from './types';

// Reads are GET, writes POST (examples/recipe-api/API.md). Pass an AbortSignal to cancel a request.
const GET = 'GET' as const;

export const api = {
  recipes: {
    list: (signal?: AbortSignal) =>
      apiFetch<Recipe[]>(API.RECIPES_LIST, null, { method: GET, signal }),

    show: (id: string, signal?: AbortSignal) =>
      apiFetch<Recipe>(`${API.RECIPES_SHOW}?${new URLSearchParams({ id })}`, null, { method: GET, signal }),

    create: (recipe: NewRecipe) =>
      apiFetch<Recipe>(API.RECIPES_CREATE, recipe),

    update: (id: string, updates: Partial<NewRecipe>) =>
      apiFetch<Recipe>(API.RECIPES_UPDATE, { id, ...updates }),

    delete: (id: string) =>
      apiFetch<void>(API.RECIPES_DELETE, { id }),

    search: (params: RecipeSearch, signal?: AbortSignal) => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== '') query.set(key, String(value));
      }
      return apiFetch<Recipe[]>(`${API.RECIPES_SEARCH}?${query}`, null, { method: GET, signal });
    },
  },
};
