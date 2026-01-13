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
	mealConsumptions,
	consumptionEvents,
} from '@/db/schema';
import {
	RecipeIngredientInsert,
	RecipeInsert,
	MealPlanEntryInsert,
	ShoppingListInsert,
	ShoppingListItemInsert,
	GroceryListItem,
	StockItem,
	MealCycleSelect,
	MealConsumptionInsert,
	ConsumptionEventInsert,
} from '@/types';
import { formatLocalDate } from '@/lib/date-utils';
import { neon } from '@neondatabase/serverless';
import {
	desc,
	eq,
	InferInsertModel,
	and,
	gte,
	lte,
	sql as sqlAgg,
	inArray,
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

export const getRecipeById = async (recipeId: string) => {
	return db.select().from(recipes).where(eq(recipes.id, recipeId)).limit(1);
};

export const getFullRecipeById = async (recipeId: string) => {
	const recipe = await db
		.select()
		.from(recipes)
		.where(eq(recipes.id, recipeId))
		.limit(1);

	if (recipe.length === 0) return null;

	const ingredients = await db
		.select({
			id: recipeIngredients.id,
			pantryItemId: recipeIngredients.pantryItemId,
			qtyPerServing: recipeIngredients.qtyPerServing,
			notes: recipeIngredients.notes,
			name: pantryItems.name,
			baseUnit: pantryItems.baseUnit,
			kcalPerBaseUnit: pantryItems.kcalPerBaseUnit,
			proteinPerBaseUnit: pantryItems.proteinPerBaseUnit,
			carbsPerBaseUnit: pantryItems.carbsPerBaseUnit,
			fatPerBaseUnit: pantryItems.fatPerBaseUnit,
		})
		.from(recipeIngredients)
		.leftJoin(pantryItems, eq(recipeIngredients.pantryItemId, pantryItems.id))
		.where(eq(recipeIngredients.recipeId, recipeId));

	return {
		...recipe[0],
		ingredients,
	};
};

//Recipe Ingredient DAL functions
export const addRecipeIngredients = async (items: RecipeIngredientInsert[]) => {
	return db.insert(recipeIngredients).values(items).returning();
};

export const getRecipeIngredients = async (recipeId: string) => {
	return db
		.select()
		.from(recipeIngredients)
		.where(eq(recipeIngredients.recipeId, recipeId));
};

export const deleteRecipe = async (recipeId: string) => {
	return db.delete(recipes).where(eq(recipes.id, recipeId)).returning();
};

export const updateRecipe = async (
	recipeId: string,
	recipe: Partial<RecipeInsert>
) => {
	return db
		.update(recipes)
		.set(recipe)
		.where(eq(recipes.id, recipeId))
		.returning();
};

export const deleteRecipeIngredients = async (recipeId: string) => {
	return db
		.delete(recipeIngredients)
		.where(eq(recipeIngredients.recipeId, recipeId))
		.returning();
};

export const updateRecipeIngredients = async (
	recipeId: string,
	items: RecipeIngredientInsert[]
) => {
	// Delete existing ingredients first
	await deleteRecipeIngredients(recipeId);
	// Then insert new ones
	if (items.length > 0) {
		return db.insert(recipeIngredients).values(items).returning();
	}
	return [];
};

// Meal Cycle DAL functions
export async function getOrCreateCurrentCycle(userId: string, date: Date) {
	const startOfWeek = date ?? new Date();
	const day = startOfWeek.getDay();
	const diff = startOfWeek.getDate() - day + 1;
	startOfWeek.setDate(diff);
	startOfWeek.setHours(0, 0, 0, 0);

	const startStr = formatLocalDate(startOfWeek);
	const endOfWeek = new Date(startOfWeek);
	endOfWeek.setDate(startOfWeek.getDate() + 6);
	const endStr = formatLocalDate(endOfWeek);

	const existingCycle = await db
		.select()
		.from(mealCycles)
		.where(
			and(
				eq(mealCycles.userId, userId),
				gte(mealCycles.startDate, startStr),
				lte(mealCycles.endDate, endStr)
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
			startDate: startStr,
			endDate: endStr,
			status: 'planning',
		})
		.returning();

	return newCycle[0];
}

export async function getThisWeekCycle(
	userId: string
): Promise<MealCycleSelect | null> {
	const startOfWeek = new Date();
	const day = startOfWeek.getDay();
	const diff = startOfWeek.getDate() - day + 1;
	startOfWeek.setDate(diff);
	startOfWeek.setHours(0, 0, 0, 0);

	const startStr = formatLocalDate(startOfWeek);
	const endOfWeek = new Date(startOfWeek);
	endOfWeek.setDate(startOfWeek.getDate() + 6);
	const endStr = formatLocalDate(endOfWeek);

	const existingCycle = await db
		.select()
		.from(mealCycles)
		.where(
			and(
				eq(mealCycles.userId, userId),
				gte(mealCycles.startDate, startStr),
				lte(mealCycles.endDate, endStr)
			)
		)
		.limit(1);

	if (existingCycle.length > 0) {
		return existingCycle[0];
	} else {
		return null;
	}
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
export async function getMealPlanEntry(entryId: string) {
	return db
		.select()
		.from(mealPlanEntries)
		.where(eq(mealPlanEntries.id, entryId));
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
				fixedBuyQty: pantryItems.fixedBuyQty,
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
			.where(
				and(
					eq(mealPlanEntries.cycleId, cycleId),
					eq(mealPlanEntries.done, false)
				)
			)
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
			const fixedBuyQty = parseFloat(item.fixedBuyQty || '0');
			let toBuy = Math.max(0, totalNeeded - inStock);
			if (fixedBuyQty && fixedBuyQty > 0) {
				if (toBuy > fixedBuyQty) {
					toBuy = Math.ceil(toBuy / fixedBuyQty) * fixedBuyQty;
				} else if (toBuy < fixedBuyQty) {
					toBuy = fixedBuyQty;
				}
			}

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
 * Delete a single shopping list item by ID
 */
export async function deleteShoppingListItem(itemId: string) {
	try {
		const deleted = await db
			.delete(shoppingListItems)
			.where(eq(shoppingListItems.id, itemId))
			.returning();

		return deleted[0] || null;
	} catch (error) {
		console.error('[deleteShoppingListItem] Error:', error);
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

// Get lot id by by pantry item

export async function getStockLotByItemId(pantryItemId: string) {
	try {
		const lot = await db
			.select()
			.from(stockLots)
			.where(eq(stockLots.pantryItemId, pantryItemId))
			.limit(1);
		return lot[0];
	} catch (error) {
		console.error('[getStockLotIdByItemId] Error:', error);
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

/**
 * Delete specific stock lot by id
 */

export async function deleteStockLotByLotId(lotId: string) {
	try {
		const deleted = await db
			.delete(stockLots)
			.where(eq(stockLots.id, lotId))
			.returning();

		return deleted;
	} catch (error) {
		console.error('[deleteStockLotByLotId] Error:', error);
		throw error;
	}
}

// ============================================
// MEAL CONSUMPTION TRACKING FUNCTIONS
// ============================================

/**
 * Mark a meal as consumed
 * This creates a meal consumption record, marks the plan entry as done,
 * and records individual ingredient consumption events.
 */
export async function markMealConsumption(
	userId: string,
	mealPlanEntryId: string,
	notes?: string
) {
	try {
		// 1. Get the meal plan entry to extract recipeId and servings
		const entry = await db
			.select()
			.from(mealPlanEntries)
			.where(eq(mealPlanEntries.id, mealPlanEntryId))
			.limit(1);

		if (!entry[0]) {
			throw new Error('Meal plan entry not found');
		}

		// 2. Mark the meal plan entry as done
		await db
			.update(mealPlanEntries)
			.set({ done: true })
			.where(eq(mealPlanEntries.id, mealPlanEntryId));

		// 3. Create meal consumption record
		const consumption = await db
			.insert(mealConsumptions)
			.values({
				userId,
				mealPlanEntryId,
				recipeId: entry[0].recipeId,
				notes,
			})
			.returning();

		const mealConsumptionId = consumption[0].id;

		// 4. Record ingredient consumption events
		// Get ingredients for this recipe
		const ingredients = await getRecipeIngredients(entry[0].recipeId);

		if (ingredients.length > 0) {
			const servings = parseFloat(entry[0].servings || '1');

			const events: ConsumptionEventInsert[] = ingredients.map((ing) => ({
				userId,
				pantryItemId: ing.pantryItemId,
				qty: (parseFloat(ing.qtyPerServing) * servings).toString(),
				mealConsumptionId: mealConsumptionId,
			}));

			await db.insert(consumptionEvents).values(events);
		}

		return consumption[0];
	} catch (error) {
		console.error('[markMealConsumption] Error:', error);
		throw error;
	}
}

/**
 * Get recent meal consumption history
 * Returns meals consumed in the last N days
 */
export async function getRecentMealConsumptions(
	userId: string,
	days: number = 7
) {
	try {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		return db
			.select({
				id: mealConsumptions.id,
				consumedAt: mealConsumptions.consumedAt,
				notes: mealConsumptions.notes,
				recipeName: recipes.name,
				recipeId: recipes.id,
			})
			.from(mealConsumptions)
			.leftJoin(recipes, eq(mealConsumptions.recipeId, recipes.id))
			.where(
				and(
					eq(mealConsumptions.userId, userId),
					gte(mealConsumptions.consumedAt, startDate)
				)
			)
			.orderBy(desc(mealConsumptions.consumedAt));
	} catch (error) {
		console.error('[getRecentMealConsumptions] Error:', error);
		throw error;
	}
}

/**
 * Get current week progress (planned vs completed meals)
 * Shows how many meals have been completed out of total planned
 */
export async function getCurrentWeekProgress(userId: string, cycleId: string) {
	try {
		const result = await db
			.select({
				totalPlanned: sqlAgg<number>`COUNT(${mealPlanEntries.id})`.as(
					'total_planned'
				),
				totalCompleted:
					sqlAgg<number>`COUNT(CASE WHEN ${mealPlanEntries.done} = true THEN 1 END)`.as(
						'total_completed'
					),
			})
			.from(mealPlanEntries)
			.where(eq(mealPlanEntries.cycleId, cycleId));

		const planned = result[0]?.totalPlanned || 0;
		const completed = result[0]?.totalCompleted || 0;

		return {
			planned,
			completed,
			remaining: planned - completed,
			completionRate: planned > 0 ? (completed / planned) * 100 : 0,
		};
	} catch (error) {
		console.error('[getCurrentWeekProgress] Error:', error);
		throw error;
	}
}

/**
 * Get user's favorite/most-eaten recipes
 * Returns recipes ordered by consumption frequency
 */
export async function getFavoriteRecipes(userId: string, limit: number = 10) {
	try {
		return db
			.select({
				recipeId: recipes.id,
				recipeName: recipes.name,
				timesEaten: sqlAgg<number>`COUNT(${mealConsumptions.id})`.as(
					'times_eaten'
				),
				lastEaten: sqlAgg<Date>`MAX(${mealConsumptions.consumedAt})`.as(
					'last_eaten'
				),
			})
			.from(mealConsumptions)
			.leftJoin(recipes, eq(mealConsumptions.recipeId, recipes.id))
			.where(eq(mealConsumptions.userId, userId))
			.groupBy(recipes.id, recipes.name)
			.orderBy(desc(sqlAgg`COUNT(${mealConsumptions.id})`))
			.limit(limit);
	} catch (error) {
		console.error('[getFavoriteRecipes] Error:', error);
		throw error;
	}
}

/**
 * Check if the user has enough stock for all ingredients in a recipe
 */
export async function checkStockForRecipe(
	userId: string,
	recipeId: string,
	servings: number = 1
) {
	try {
		// 1. Get recipe ingredients with their names
		const ingredients = await db
			.select({
				pantryItemId: recipeIngredients.pantryItemId,
				qtyPerServing: recipeIngredients.qtyPerServing,
				name: pantryItems.name,
			})
			.from(recipeIngredients)
			.leftJoin(pantryItems, eq(recipeIngredients.pantryItemId, pantryItems.id))
			.where(eq(recipeIngredients.recipeId, recipeId));

		if (ingredients.length === 0)
			return { hasEnoughStock: true, missingIngredients: [] };

		// 2. Get current stock for the user
		const stock = await getCurrentStock(userId);
		const stockMap = new Map(
			stock.map((s) => [s.pantryItemId, parseFloat(s.totalInStock || '0')])
		);

		// 3. Compare required vs stock
		const missingIngredients = ingredients
			.map((ing) => {
				const required = parseFloat(ing.qtyPerServing) * servings;
				const inStock = stockMap.get(ing.pantryItemId!) || 0;
				if (required > inStock) {
					return {
						name: ing.name!,
						required,
						inStock,
					};
				}
				return null;
			})
			.filter((m): m is NonNullable<typeof m> => m !== null);

		return {
			hasEnoughStock: missingIngredients.length === 0,
			missingIngredients,
		};
	} catch (error) {
		console.error('[checkStockForRecipe] Error:', error);
		throw error;
	}
}

/**
 * Suggests recipes that the user can cook right now based on current stock levels.
 */
export async function getCookableRecipes(userId: string) {
	try {
		// 1. Get all recipes for this user
		const userRecipes = await getRecipes(userId);
		if (userRecipes.length === 0) return [];

		// 2. Get all ingredients for these recipes in one batch
		const recipeIds = userRecipes.map((r) => r.id);
		const allIngredients = await db
			.select({
				recipeId: recipeIngredients.recipeId,
				pantryItemId: recipeIngredients.pantryItemId,
				qtyPerServing: recipeIngredients.qtyPerServing,
			})
			.from(recipeIngredients)
			.where(inArray(recipeIngredients.recipeId, recipeIds));

		// 3. Get current stock
		const stock = await getCurrentStock(userId);
		const stockMap = new Map(
			stock.map((s) => [s.pantryItemId, parseFloat(s.totalInStock || '0')])
		);

		// 4. Group ingredients by recipe for easy checking
		const ingredientsByRecipe = new Map<string, typeof allIngredients>();
		for (const ing of allIngredients) {
			const existing = ingredientsByRecipe.get(ing.recipeId) || [];
			existing.push(ing);
			ingredientsByRecipe.set(ing.recipeId, existing);
		}

		// 5. Filter recipes where EVERY ingredient is in stock for 1 serving
		const cookableRecipes = userRecipes.filter((recipe) => {
			const ingredients = ingredientsByRecipe.get(recipe.id) || [];
			if (ingredients.length === 0) return false; // Skip recipes with no ingredients

			return ingredients.every((ing) => {
				const available = stockMap.get(ing.pantryItemId) || 0;
				const required = parseFloat(ing.qtyPerServing);
				return available >= required;
			});
		});

		return cookableRecipes;
	} catch (error) {
		console.error('[getCookableRecipes] Error:', error);
		throw error;
	}
}

/**
 * Gets stock lots that are expiring within a certain threshold of days.
 */
export async function getExpiringStock(
	userId: string,
	daysThreshold: number = 3
) {
	try {
		const now = new Date();
		const thresholdDate = new Date();
		thresholdDate.setDate(now.getDate() + daysThreshold);

		// Format to YYYY-MM-DD for comparison with 'date' columns
		const nowStr = formatLocalDate(now);
		const thresholdStr = formatLocalDate(thresholdDate);

		return await db
			.select({
				id: stockLots.id,
				pantryItemId: stockLots.pantryItemId,
				ingredientName: pantryItems.name,
				baseUnit: pantryItems.baseUnit,
				qtyRemaining: stockLots.qtyRemaining,
				expiresAt: stockLots.expiresAt,
			})
			.from(stockLots)
			.leftJoin(pantryItems, eq(stockLots.pantryItemId, pantryItems.id))
			.where(
				and(
					eq(stockLots.userId, userId),
					sqlAgg`CAST(${stockLots.qtyRemaining} AS NUMERIC) > 0`,
					gte(stockLots.expiresAt, nowStr),
					lte(stockLots.expiresAt, thresholdStr)
				)
			)
			.orderBy(stockLots.expiresAt);
	} catch (error) {
		console.error('[getExpiringStock] Error:', error);
		throw error;
	}
}

/**
 * Gets pantry items where the total stock is less than 20% of the fixed buy quantity.
 */
export async function getLowStockItems(userId: string) {
	try {
		return await db
			.select({
				id: pantryItems.id,
				name: pantryItems.name,
				baseUnit: pantryItems.baseUnit,
				fixedBuyQty: pantryItems.fixedBuyQty,
				totalInStock: sqlAgg<string>`
					COALESCE(SUM(CAST(${stockLots.qtyRemaining} AS NUMERIC)), 0)
				`.as('total_in_stock'),
			})
			.from(pantryItems)
			.leftJoin(stockLots, eq(pantryItems.id, stockLots.pantryItemId))
			.where(
				and(
					eq(pantryItems.userId, userId),
					sqlAgg`CAST(${pantryItems.fixedBuyQty} AS NUMERIC) > 0`
				)
			)
			.groupBy(
				pantryItems.id,
				pantryItems.name,
				pantryItems.baseUnit,
				pantryItems.fixedBuyQty
			)
			.having(
				sqlAgg`COALESCE(SUM(CAST(${stockLots.qtyRemaining} AS NUMERIC)), 0) <= 0.2 * CAST(${pantryItems.fixedBuyQty} AS NUMERIC)`
			);
	} catch (error) {
		console.error('[getLowStockItems] Error:', error);
		throw error;
	}
}

/**
 * Calculates the consecutive days of completing all planned meals.
 */
export async function getConsumptionStreak(userId: string) {
	try {
		// 1. Get all entries for this user ordered by day desc
		const entries = await db
			.select({
				day: mealPlanEntries.day,
				done: mealPlanEntries.done,
			})
			.from(mealPlanEntries)
			.innerJoin(mealCycles, eq(mealPlanEntries.cycleId, mealCycles.id))
			.where(eq(mealCycles.userId, userId))
			.orderBy(desc(mealPlanEntries.day));

		if (entries.length === 0) return 0;

		// 2. Group by day and check if all are done
		const dayStatus = new Map<string, boolean>();
		for (const entry of entries) {
			const current = dayStatus.get(entry.day) ?? true;
			dayStatus.set(entry.day, current && entry.done);
		}

		// 3. Get sorted list of dates with planned meals
		const sortedDates = Array.from(dayStatus.keys()).sort((a, b) =>
			b.localeCompare(a)
		);

		const today = formatLocalDate(new Date());

		let streak = 0;
		let checkDate = today;
		let foundIncomplete = false;

		// We check backwards from today
		// If today has plans and is not done, it doesn't break the streak yet IF yesterday was done
		// But it won't be counted in the streak until it's finished.

		for (const date of sortedDates) {
			// If we skipped today because it's in progress, that's fine.
			// But if we find a date in the past that had plans and wasn't finished, streak ends.
			if (date > today) continue; // Future plans don't affect current streak

			const isDone = dayStatus.get(date);

			if (isDone) {
				streak++;
			} else {
				// If today is incomplete, it doesn't break a streak from yesterday.
				// But if anything older than today is incomplete, the streak is broken.
				if (date < today) {
					break;
				}
				// If today is incomplete, we just move on to check yesterday and beyond.
				// The streak will be whatever was completed before today.
			}
		}

		return streak;
	} catch (error) {
		console.error('[getConsumptionStreak] Error:', error);
		throw error;
	}
}
