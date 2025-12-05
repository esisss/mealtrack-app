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
export type MealCycleSelect = InferSelectModel<typeof schema.mealCycles>;
export type MealCycleInsert = InferInsertModel<typeof schema.mealCycles>;
export type MealPlanEntrySelect = InferSelectModel<
	typeof schema.mealPlanEntries
>;
export type MealPlanEntryInsert = InferInsertModel<
	typeof schema.mealPlanEntries
>;
export type ShoppingListSelect = InferSelectModel<typeof schema.shoppingLists>;
export type ShoppingListInsert = InferInsertModel<typeof schema.shoppingLists>;
export type ShoppingListItemSelect = InferSelectModel<
	typeof schema.shoppingListItems
>;
export type ShoppingListItemInsert = InferInsertModel<
	typeof schema.shoppingListItems
>;

// Combined type for displaying grocery items
export type GroceryListItem = {
	id: string;
	pantryItemId: string;
	ingredientName: string;
	baseUnit: string;
	toBuyQty: number;
	status: 'pending' | 'bought' | 'skipped';
};
