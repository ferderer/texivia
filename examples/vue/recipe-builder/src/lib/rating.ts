import type { Recipe } from './api/types';

/** Average of the ratings, 0 for a recipe nobody rated yet. */
export function averageRating(recipe: Pick<Recipe, 'ratings'>): number {
  const { ratings } = recipe;
  return ratings.length ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
}
