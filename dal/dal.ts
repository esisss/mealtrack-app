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
	StockItem,
	StockLotInsert,
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
	const startOfWeek = date ?? new Date();
	const day = startOfWeek.getDay();
	const diff = startOfWeek.getDate() - day + 1;
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
		// Check if a shopping list already exists for this cycle
		const existingList = await db
			.select()
			.from(shoppingLists)
			.where(eq(shoppingLists.cycleId, cycleId))
			.limit(1);

		if (existingList.length > 0) {
			return existingList[0];
		}

		// Create a new shopping list
		const newList = await db
			.insert(shoppingLists)
			.values({ cycleId })
			.returning();

		// Get the grocery list items
		const groceryItems = await getGroceryListForCycle(cycleId, userId);

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

			const insertedItems = await db
				.insert(shoppingListItems)
				.values(itemsToInsert)
				.returning();
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

/**
 * Get a shopping list item by ID
 */
export async function getShoppingListItemById(itemId: string) {
	const result = await db
		.select()
		.from(shoppingListItems)
		.where(eq(shoppingListItems.id, itemId))
		.limit(1);

	return result[0] || null;
}

/**
 * Delete all shopping list items for a given list
 */
export async function deleteShoppingListItems(listId: string) {
	try {
		const deleted = await db
			.delete(shoppingListItems)
			.where(eq(shoppingListItems.listId, listId))
			.returning();

		return deleted;
	} catch (error) {
		console.error('[deleteShoppingListItems] Error:', error);
		throw error;
	}
}

/**
 * Update the shopping list for a cycle
 * This recalculates the grocery needs based on the current meal plan
 * and updates the shopping list accordingly
 */
export async function updateShoppingListForCycle(
	cycleId: string,
	userId: string
) {
	try {
		// Get or create the shopping list
		const shoppingList = await getOrCreateShoppingListForCycle(cycleId, userId);

		// Fetch existing items
		const existingItems = await db
			.select({
				pantryItemId: shoppingListItems.pantryItemId,
				toBuyQty: shoppingListItems.toBuyQty,
			})
			.from(shoppingListItems)
			.where(eq(shoppingListItems.listId, shoppingList.id));

		// Create a map for quick lookup: pantryItemId -> { previousToBuyQty }
		const statusMap = new Map(
			existingItems.map((item) => [
				item.pantryItemId,
				{
					previousToBuyQty: parseFloat(item.toBuyQty || '0'),
				},
			])
		);

		// Delete all existing items (full recalculation approach)
		await deleteShoppingListItems(shoppingList.id);

		// Get fresh grocery list based on current meal plan
		const groceryItems = await getGroceryListForCycle(cycleId, userId);

		// Insert new items
		if (groceryItems.length > 0) {
			const itemsToInsert = groceryItems.map((item) => {
				// Get previous status and quantity
				const previousData = statusMap.get(item.pantryItemId!);
				const previousToBuyQty = previousData?.previousToBuyQty || 0;
				const currentToBuyQty = item.toBuy;

				// Determine status:
				// - If item is new (no previous status), default to 'pending'
				// - If item was 'bought' but quantity increased, reset to 'pending'
				// - Otherwise, preserve previous status
				let status: 'pending' | 'bought' | 'skipped' = 'pending';

				if (previousToBuyQty) {
					if (currentToBuyQty > previousToBuyQty) {
						// Quantity increased, reset to pending
						status = 'pending';
					}
				}

				return {
					listId: shoppingList.id,
					pantryItemId: item.pantryItemId!,
					requiredQty: item.totalRequired.toString(),
					onHandQty: item.inStock.toString(),
					toBuyQty: item.toBuy.toString(),
					status: status,
				};
			});

			const inserted = await db
				.insert(shoppingListItems)
				.values(itemsToInsert)
				.returning();

			return {
				listId: shoppingList.id,
				itemsCount: inserted.length,
				items: inserted,
			};
		}

		return {
			listId: shoppingList.id,
			itemsCount: 0,
			items: [],
		};
	} catch (error) {
		console.error('[updateShoppingListForCycle] Error:', error);
		throw error;
	}
}

// ============================================
// STOCK MANAGEMENT FUNCTIONS
// ============================================

/**
 * Get current stock with enhanced details including expiry dates
 */
export async function getCurrentStockWithDetails(
	userId: string
): Promise<StockItem[]> {
	try {
		const result = await db
			.select({
				pantryItemId: pantryItems.id,
				ingredientName: pantryItems.name,
				baseUnit: pantryItems.baseUnit,
				totalInStock: sqlAgg<string>`
					COALESCE(SUM(CAST(${stockLots.qtyRemaining} AS NUMERIC)), 0)
				`.as('total_in_stock'),
				lotCount: sqlAgg<number>`COUNT(${stockLots.id})`.as('lot_count'),
				earliestExpiry: sqlAgg<Date | null>`MIN(${stockLots.expiresAt})`.as(
					'earliest_expiry'
				),
			})
			.from(stockLots)
			.leftJoin(pantryItems, eq(stockLots.pantryItemId, pantryItems.id))
			.where(eq(stockLots.userId, userId))
			.groupBy(pantryItems.id, pantryItems.name, pantryItems.baseUnit);

		const stockItems = result
			.filter((item) => item.pantryItemId !== null)
			.map((item) => ({
				pantryItemId: item.pantryItemId!,
				ingredientName: item.ingredientName!,
				baseUnit: item.baseUnit!,
				totalInStock: parseFloat(item.totalInStock || '0'),
				lotCount: item.lotCount,
				earliestExpiry: item.earliestExpiry,
			}));

		return stockItems;
	} catch (error) {
		console.error('[getCurrentStockWithDetails] Error:', error);
		throw error;
	}
}

/**
 * Add a new stock lot
 */
export async function addStockLot(
	userId: string,
	pantryItemId: string,
	quantity: number,
	expiresAt?: Date
) {
	try {
		const newLot = await db
			.insert(stockLots)
			.values({
				userId,
				pantryItemId,
				qtyInitial: quantity.toString(),
				qtyRemaining: quantity.toString(),
				expiresAt: expiresAt?.toISOString(),
			})
			.returning();

		return newLot[0];
	} catch (error) {
		console.error('[addStockLot] Error:', error);
		throw error;
	}
}

/**
 * Adjust the remaining quantity of a stock lot
 */
export async function adjustStockQuantity(lotId: string, newQuantity: number) {
	try {
		const updated = await db
			.update(stockLots)
			.set({ qtyRemaining: newQuantity.toString() })
			.where(eq(stockLots.id, lotId))
			.returning();

		return updated[0];
	} catch (error) {
		console.error('[adjustStockQuantity] Error:', error);
		throw error;
	}
}

/**
 * Get all stock lots for a specific pantry item
 */
export async function getStockLotsByItem(userId: string, pantryItemId: string) {
	try {
		const lots = await db
			.select()
			.from(stockLots)
			.where(
				and(
					eq(stockLots.userId, userId),
					eq(stockLots.pantryItemId, pantryItemId)
				)
			)
			.orderBy(stockLots.acquiredAt);

		return lots;
	} catch (error) {
		console.error('[getStockLotsByItem] Error:', error);
		throw error;
	}
}

/**
 * Delete all stock lots for a specific pantry item
 */
export async function deleteStockLotsByItem(
	userId: string,
	pantryItemId: string
) {
	try {
		const deleted = await db
			.delete(stockLots)
			.where(
				and(
					eq(stockLots.userId, userId),
					eq(stockLots.pantryItemId, pantryItemId)
				)
			)
			.returning();

		return deleted;
	} catch (error) {
		console.error('[deleteStockLotsByItem] Error:', error);
		throw error;
	}
}
