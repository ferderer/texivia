// Error and response types come from texivia-fetch; field errors are { code, path, value }.
export type { ApiError, ApiResponse, ValidationError } from 'texivia-fetch';

// Recipe types, see examples/recipe-api/API.md
export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  dietaryTags: string[];
  ingredients: Ingredient[];
  instructions: Instruction[];
  nutrition: NutritionInfo;
  images: string[];
  author: string;
  ratings: number[];
  createdAt: string; // ISO 8601, set by the server
  updatedAt: string;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
}

export interface Instruction {
  step: number;
  description: string;
  duration?: number;
  image?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

/** What `create` takes: the server assigns id and timestamps and ignores `ratings`. */
export type NewRecipe = Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>;

/** Parameters of `search`, all optional. */
export interface RecipeSearch {
  query?: string;
  cuisine?: string;
  difficulty?: Recipe['difficulty'];
  maxCookTime?: number;
  sort?: 'relevance' | 'rating' | 'cookTime' | 'title';
}
