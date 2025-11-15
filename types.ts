import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import * as schema from '@/db/schema';

export type PantryItemSelect = InferSelectModel<typeof schema.pantryItems>;
export type PantryItemInsert = InferInsertModel<typeof schema.pantryItems>;
export type RecipeIngredientSelect = InferSelectModel<
	typeof schema.recipeIngredients
>;
export type RecipeSelect = InferSelectModel<typeof schema.recipes>;
export type RecipeInsert = InferInsertModel<typeof schema.recipes>;
export type RecipeIngredientInsert = InferInsertModel<
	typeof schema.recipeIngredients
>;
