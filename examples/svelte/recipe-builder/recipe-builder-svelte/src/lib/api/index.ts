import { apiFetch } from './fetcher';
import { API } from './endpoints';
import type * as Types from './types';

export const api = {
  recipes: {
    list: async (): Promise<Types.ApiResponse<Types.Recipe[]>> =>
      await apiFetch(API.RECIPES_LIST),

    show: async (id: string): Promise<Types.ApiResponse<Types.Recipe>> =>
      await apiFetch(API.RECIPES_SHOW, { id }),

    create: async (recipe: Omit<Types.Recipe, 'id' | 'createdAt' | 'updatedAt'>): Promise<Types.ApiResponse<Types.Recipe>> =>
      await apiFetch(API.RECIPES_CREATE, recipe),

    update: async (id: string, updates: Partial<Types.Recipe>): Promise<Types.ApiResponse<Types.Recipe>> =>
      await apiFetch(API.RECIPES_UPDATE, { id, ...updates }),

    delete: async (id: string): Promise<Types.ApiResponse<void>> =>
      await apiFetch(API.RECIPES_DELETE, { id }),

    search: async (query: string, filters?: any): Promise<Types.ApiResponse<Types.Recipe[]>> =>
      await apiFetch(API.RECIPES_SEARCH, { query, filters }),
  }
};
