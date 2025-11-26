'use server';

import {
	pantryItems,
	recipeIngredients,
	recipes,
	mealCycles,
	mealPlanEntries,
} from '@/db/schema';
import {
	RecipeIngredientInsert,
	RecipeInsert,
	MealPlanEntryInsert,
} from '@/types';
import { neon } from '@neondatabase/serverless';
import { desc, eq, InferInsertModel, and, gte, lte } from 'drizzle-orm';
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

// Meal Cycle DAL functions
export async function getOrCreateCurrentCycle(userId: string, date: Date) {
	const startOfWeek = new Date(date);
	const day = startOfWeek.getDay();
	const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
	startOfWeek.setDate(diff);
	startOfWeek.setHours(0, 0, 0, 0);

	const endOfWeek = new Date(startOfWeek);
	endOfWeek.setDate(startOfWeek.getDate() + 6);
	endOfWeek.setHours(23, 59, 59, 999);

	const existingCycle = await db
		.select()
		.from(mealCycles)
		.where(
			and(
				eq(mealCycles.userId, userId),
				gte(mealCycles.startDate, startOfWeek.toISOString()),
				lte(mealCycles.endDate, endOfWeek.toISOString())
			)
		)
		.limit(1);

	if (existingCycle.length > 0) {
		return existingCycle[0];
	}

	const newCycle = await db
		.insert(mealCycles)
		.values({
			userId,
			startDate: startOfWeek.toISOString(),
			endDate: endOfWeek.toISOString(),
			status: 'planning',
		})
		.returning();

	return newCycle[0];
}

export async function getCycleEntries(cycleId: string) {
	return db
		.select({
			id: mealPlanEntries.id,
			cycleId: mealPlanEntries.cycleId,
			day: mealPlanEntries.day,
			mealType: mealPlanEntries.mealType,
			recipeId: mealPlanEntries.recipeId,
			servings: mealPlanEntries.servings,
			done: mealPlanEntries.done,
			recipeName: recipes.name,
		})
		.from(mealPlanEntries)
		.leftJoin(recipes, eq(mealPlanEntries.recipeId, recipes.id))
		.where(eq(mealPlanEntries.cycleId, cycleId));
}

export async function addMealPlanEntry(entry: MealPlanEntryInsert) {
	return db.insert(mealPlanEntries).values(entry).returning();
}

export async function removeMealPlanEntry(entryId: string) {
	return db.delete(mealPlanEntries).where(eq(mealPlanEntries.id, entryId));
}
