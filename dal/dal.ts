'use server';

import {
	pantryItems,
	recipeIngredients,
	recipes,
	mealCycles,
	mealPlanEntries,
	stockLots,
	shoppingLists,
	shoppingListItems,
} from '@/db/schema';
import {
	RecipeIngredientInsert,
	RecipeInsert,
	MealPlanEntryInsert,
	ShoppingListInsert,
	ShoppingListItemInsert,
	GroceryListItem,
} from '@/types';
import { neon } from '@neondatabase/serverless';
import {
	desc,
	eq,
	InferInsertModel,
	and,
	gte,
	lte,
	sql as sqlAgg,
} from 'drizzle-orm';
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

// ============================================
// PANTRY QUERY FUNCTIONS
// ============================================

/**
 * Query 1: Calculate Required Ingredients for a Cycle
 *
 * This function answers: "What ingredients do I need for all meals in this cycle?"
 *
 * HOW IT WORKS:
 * 1. Start from mealPlanEntries (the meals planned for the week)
 * 2. Join with recipeIngredients to get what ingredients each recipe needs
 * 3. Join with pantryItems to get the ingredient details (name, unit, etc.)
 * 4. Multiply qty_per_serving × servings to get total needed
 * 5. Group by pantryItemId and SUM to get total quantity needed
 *
 * DRIZZLE CONCEPTS USED:
 * - .select() with custom fields: We specify exactly what columns we want
 * - .from() and .leftJoin(): Connect tables together (like SQL JOIN)
 * - .where(): Filter results (only this cycle's entries)
 * - sqlAgg`...`: Write raw SQL for complex calculations (SUM, multiplication)
 * - .groupBy(): Combine rows with the same pantryItemId
 */
export async function getRequiredIngredientsForCycle(cycleId: string) {
	return (
		db
			.select({
				// The ingredient's unique ID
				pantryItemId: pantryItems.id,

				// The ingredient's name (e.g., "Rice", "Chicken")
				ingredientName: pantryItems.name,

				// The unit of measurement (g, ml, unit, etc.)
				baseUnit: pantryItems.baseUnit,

				// TOTAL quantity needed across ALL meals in the cycle
				// This uses SQL aggregation: SUM(qty_per_serving * servings)
				// Example: If you have rice in 3 meals (200g, 150g, 100g), this returns 450g
				totalRequired: sqlAgg<string>`
				COALESCE(
					SUM(
						CAST(${recipeIngredients.qtyPerServing} AS NUMERIC) * 
						CAST(${mealPlanEntries.servings} AS NUMERIC)
					), 
					0
				)
			`.as('total_required'),
			})
			// Start from meal plan entries (the meals you've planned)
			.from(mealPlanEntries)

			// Connect to recipe_ingredients to see what each recipe needs
			// LEFT JOIN means: include the meal even if recipe has no ingredients
			.leftJoin(
				recipeIngredients,
				eq(mealPlanEntries.recipeId, recipeIngredients.recipeId)
			)

			// Connect to pantry_items to get ingredient details
			.leftJoin(pantryItems, eq(recipeIngredients.pantryItemId, pantryItems.id))

			// Only get entries for THIS specific cycle
			.where(eq(mealPlanEntries.cycleId, cycleId))

			// Group results by ingredient so we get ONE row per ingredient
			// with the TOTAL quantity needed across all meals
			.groupBy(pantryItems.id, pantryItems.name, pantryItems.baseUnit)
	);
}

/**
 * Query 2: Get Current Stock
 *
 * This function answers: "What ingredients do I currently have in my pantry?"
 *
 * HOW IT WORKS:
 * 1. Start from stockLots (individual purchases/additions to pantry)
 * 2. Join with pantryItems to get ingredient details
 * 3. SUM the qty_remaining for each ingredient (you might have multiple lots)
 * 4. Group by pantryItemId to get total stock per ingredient
 *
 * EXAMPLE:
 * You bought rice 3 times:
 * - Lot 1: 500g remaining
 * - Lot 2: 200g remaining
 * - Lot 3: 100g remaining
 * This query returns: Rice = 800g total
 *
 * DRIZZLE CONCEPTS:
 * - Similar to Query 1, but simpler (only 2 tables)
 * - Uses SUM to aggregate multiple stock lots into one total
 */
export async function getCurrentStock(userId: string) {
	return (
		db
			.select({
				pantryItemId: pantryItems.id,
				ingredientName: pantryItems.name,
				baseUnit: pantryItems.baseUnit,

				// Total quantity in stock across all lots
				// COALESCE returns 0 if there are no lots (instead of NULL)
				totalInStock: sqlAgg<string>`
				COALESCE(SUM(CAST(${stockLots.qtyRemaining} AS NUMERIC)), 0)
			`.as('total_in_stock'),

				// Optional: Count how many separate lots you have
				// Useful for tracking: "I have rice in 3 different packages"
				lotCount: sqlAgg<number>`COUNT(${stockLots.id})`.as('lot_count'),
			})
			.from(stockLots)

			// Join to get ingredient details
			.leftJoin(pantryItems, eq(stockLots.pantryItemId, pantryItems.id))

			// Only get stock for this user
			.where(eq(stockLots.userId, userId))

			// Group by ingredient to combine all lots
			.groupBy(pantryItems.id, pantryItems.name, pantryItems.baseUnit)
	);
}

/**
 * Query 3: Calculate Grocery List (What to Buy)
 *
 * This function answers: "What do I need to buy for this cycle?"
 *
 * HOW IT WORKS:
 * 1. Get required ingredients from Query 1
 * 2. Get current stock from Query 2
 * 3. Calculate: toBuy = required - stock
 * 4. Only return items where toBuy > 0
 *
 * NOTE: This is a "composite" query - it calls the other two queries
 * and processes the results in JavaScript. This is simpler than doing
 * a complex SQL query with multiple subqueries.
 *
 * ALTERNATIVE APPROACH:
 * You could also do this in a single SQL query using subqueries or CTEs
 * (Common Table Expressions), but this approach is easier to understand
 * and maintain.
 */
export async function getGroceryListForCycle(cycleId: string, userId: string) {
	// Step 1: Get what we need for the cycle
	const required = await getRequiredIngredientsForCycle(cycleId);

	// Step 2: Get what we currently have in stock
	const stock = await getCurrentStock(userId);

	// Step 3: Create a lookup map for quick access
	// This is a JavaScript Map: pantryItemId -> stock quantity
	// Example: { "uuid-123": "500", "uuid-456": "200" }
	const stockMap = new Map(
		stock.map((item) => [
			item.pantryItemId,
			parseFloat(item.totalInStock || '0'),
		])
	);

	// Step 4: Calculate what to buy for each ingredient
	const groceryList = required
		.map((item) => {
			// Get current stock for this ingredient (0 if not in stock)
			const inStock = stockMap.get(item.pantryItemId) || 0;

			// Calculate how much we need to buy
			const totalNeeded = parseFloat(item.totalRequired || '0');
			const toBuy = Math.max(0, totalNeeded - inStock);

			return {
				pantryItemId: item.pantryItemId,
				ingredientName: item.ingredientName,
				baseUnit: item.baseUnit,
				totalRequired: totalNeeded,
				inStock: inStock,
				toBuy: toBuy,
			};
		})
		// Only include items we actually need to buy
		.filter((item) => item.toBuy > 0);

	return groceryList;
}

// ============================================
// SHOPPING LIST FUNCTIONS
// ============================================

/**
 * Get or create a shopping list for a cycle
 * If the list doesn't exist, it will be created and populated with items from getGroceryListForCycle
 */
export async function getOrCreateShoppingListForCycle(
	cycleId: string,
	userId: string
) {
	try {
		console.log('[getOrCreateShoppingListForCycle] Starting with:', {
			cycleId,
			userId,
		});

		// Check if a shopping list already exists for this cycle
		const existingList = await db
			.select()
			.from(shoppingLists)
			.where(eq(shoppingLists.cycleId, cycleId))
			.limit(1);

		if (existingList.length > 0) {
			console.log(
				'[getOrCreateShoppingListForCycle] Found existing list:',
				existingList[0].id
			);
			return existingList[0];
		}

		console.log('[getOrCreateShoppingListForCycle] Creating new list...');

		// Create a new shopping list
		const newList = await db
			.insert(shoppingLists)
			.values({ cycleId })
			.returning();

		console.log(
			'[getOrCreateShoppingListForCycle] New list created:',
			newList[0].id
		);

		// Get the grocery list items
		const groceryItems = await getGroceryListForCycle(cycleId, userId);

		console.log(
			'[getOrCreateShoppingListForCycle] Grocery items calculated:',
			groceryItems.length,
			groceryItems
		);

		// Insert shopping list items
		if (groceryItems.length > 0) {
			const itemsToInsert = groceryItems.map((item) => ({
				listId: newList[0].id,
				pantryItemId: item.pantryItemId!,
				requiredQty: item.totalRequired.toString(),
				onHandQty: item.inStock.toString(),
				toBuyQty: item.toBuy.toString(),
				status: 'pending' as const,
			}));

			console.log(
				'[getOrCreateShoppingListForCycle] Inserting items:',
				itemsToInsert
			);

			const insertedItems = await db
				.insert(shoppingListItems)
				.values(itemsToInsert)
				.returning();

			console.log(
				'[getOrCreateShoppingListForCycle] Items inserted:',
				insertedItems.length
			);
		} else {
			console.log('[getOrCreateShoppingListForCycle] No items to insert');
		}

		return newList[0];
	} catch (error) {
		console.error('[getOrCreateShoppingListForCycle] Error:', error);
		throw error;
	}
}

/**
 * Get shopping list with all items for display
 */
export async function getShoppingListWithItems(
	cycleId: string
): Promise<GroceryListItem[]> {
	try {
		console.log('[getShoppingListWithItems] Starting with cycleId:', cycleId);

		const result = await db
			.select({
				id: shoppingListItems.id,
				pantryItemId: shoppingListItems.pantryItemId,
				ingredientName: pantryItems.name,
				baseUnit: pantryItems.baseUnit,
				toBuyQty: shoppingListItems.toBuyQty,
				status: shoppingListItems.status,
			})
			.from(shoppingLists)
			.leftJoin(
				shoppingListItems,
				eq(shoppingLists.id, shoppingListItems.listId)
			)
			.leftJoin(pantryItems, eq(shoppingListItems.pantryItemId, pantryItems.id))
			.where(eq(shoppingLists.cycleId, cycleId));

		console.log('[getShoppingListWithItems] Raw result:', result);

		const filteredResult = result
			.filter((item) => item.id !== null)
			.map((item) => ({
				id: item.id!,
				pantryItemId: item.pantryItemId!,
				ingredientName: item.ingredientName!,
				baseUnit: item.baseUnit!,
				toBuyQty: parseFloat(item.toBuyQty || '0'),
				status: item.status!,
			}));

		console.log('[getShoppingListWithItems] Filtered result:', filteredResult);

		return filteredResult;
	} catch (error) {
		console.error('[getShoppingListWithItems] Error:', error);
		throw error;
	}
}

/**
 * Update the status of a shopping list item
 */
export async function updateShoppingListItemStatus(
	itemId: string,
	status: 'pending' | 'bought' | 'skipped'
) {
	return db
		.update(shoppingListItems)
		.set({ status })
		.where(eq(shoppingListItems.id, itemId))
		.returning();
}
