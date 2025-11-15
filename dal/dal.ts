'use server';

import { pantryItems, recipeIngredients, recipes } from '@/db/schema';
import { RecipeIngredientInsert, RecipeInsert } from '@/types';
import { neon } from '@neondatabase/serverless';
import { desc, eq, InferInsertModel } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });
type PantryItem = InferInsertModel<typeof pantryItems>;

//Pantry Item DAL functions
export async function getPantryItems(userId: string) {
	return db
		.select()
		.from(pantryItems)
		.where(eq(pantryItems.userId, userId))
		.orderBy(pantryItems.name);
}

export async function addPantryItems(items: PantryItem[]) {
	return db
		.insert(pantryItems)
		.values(items)
		.returning({ name: pantryItems.name, pantryItemId: pantryItems.id });
}

//Recipes DAL functions
export const addRecipe = async (recipe: RecipeInsert) => {
	return db.insert(recipes).values(recipe).returning();
};

export const getRecipes = async (userId: string) => {
	return db
		.select()
		.from(recipes)
		.where(eq(recipes.userId, userId))
		.orderBy(desc(recipes.createdAt));
};

//Recipe Ingredient DAL functions
export const addRecipeIngredients = async (items: RecipeIngredientInsert[]) => {
	return db.insert(recipeIngredients).values(items).returning();
};
