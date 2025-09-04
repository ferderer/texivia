export type ValidationError = [
  code: string,
  path: string,
  value: any,
]

export type ApiError = [
  timestamp: string | number,
  status: number,
  code: string,
  data: Record<string, any>,
  fields?: ValidationError[],
]

export type ApiResponse<T> = {
  payload: T | null,
  error: ApiError | null,
}

export type Page<T> = {
  content: T[];
  count: number;
  pages: number;
  size: number;
  current: number;
}

// Recipe types
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
  createdAt: Date;
  updatedAt: Date;
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
