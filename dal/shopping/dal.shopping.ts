"use server";
import {
  mealPlanEntries,
  pantryItems,
  recipeIngredients,
  shoppingListItems,
  shoppingLists,
  stockLots,
} from "@/db/schema";
import createDB from "../dal";
import { eq, sql as sqlAgg, and } from "drizzle-orm";
import { type GroceryListItem } from "@/types";

const db = await createDB();

export async function getRequiredIngredientsForCycle(cycleId: string) {
  return (
    db
      .select({
        pantryItemId: pantryItems.id,
        ingredientName: pantryItems.name,
        baseUnit: pantryItems.baseUnit,
        fixedBuyQty: pantryItems.fixedBuyQty,
        totalRequired: sqlAgg<string>`
				COALESCE(
					SUM(
						CAST(${recipeIngredients.qtyPerServing} AS NUMERIC) *
						CAST(${mealPlanEntries.servings} AS NUMERIC)
					),
					0
				)
			`.as("total_required"),
      })
      .from(mealPlanEntries)
      .leftJoin(
        recipeIngredients,
        eq(mealPlanEntries.recipeId, recipeIngredients.recipeId),
      )
      .leftJoin(pantryItems, eq(recipeIngredients.pantryItemId, pantryItems.id))
      .where(
        and(
          eq(mealPlanEntries.cycleId, cycleId),
          eq(mealPlanEntries.done, false),
        ),
      )
      .groupBy(pantryItems.id, pantryItems.name, pantryItems.baseUnit)
  );
}

export async function getCurrentStock(userId: string) {
  return (
    db
      .select({
        pantryItemId: pantryItems.id,
        ingredientName: pantryItems.name,
        baseUnit: pantryItems.baseUnit,
        totalInStock: sqlAgg<string>`
				COALESCE(SUM(CAST(${stockLots.qtyRemaining} AS NUMERIC)), 0)
			`.as("total_in_stock"),
        lotCount: sqlAgg<number>`COUNT(${stockLots.id})`.as("lot_count"),
      })
      .from(stockLots)
      .leftJoin(pantryItems, eq(stockLots.pantryItemId, pantryItems.id))
      .where(eq(stockLots.userId, userId))
      .groupBy(pantryItems.id, pantryItems.name, pantryItems.baseUnit)
  );
}

export async function getGroceryListForCycle(cycleId: string, userId: string) {
  const required = await getRequiredIngredientsForCycle(cycleId);
  const stock = await getCurrentStock(userId);

  const stockMap = new Map(
    stock.map((item) => [
      item.pantryItemId,
      parseFloat(item.totalInStock || "0"),
    ]),
  );

  const groceryList = required
    .map((item) => {
      const inStock = stockMap.get(item.pantryItemId) || 0;
      const totalNeeded = parseFloat(item.totalRequired || "0");
      const fixedBuyQty = parseFloat(item.fixedBuyQty || "0");
      let toBuy = Math.max(0, totalNeeded - inStock);
      if (fixedBuyQty && fixedBuyQty > 0 && toBuy > 0) {
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
    .filter((item) => item.toBuy > 0);

  return groceryList;
}

export async function getOrCreateShoppingListForCycle(
  cycleId: string,
  userId: string,
) {
  try {
    const existingList = await db
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.cycleId, cycleId))
      .limit(1);

    if (existingList.length > 0) {
      return existingList[0];
    }

    const newList = await db
      .insert(shoppingLists)
      .values({ cycleId })
      .returning();

    const groceryItems = await getGroceryListForCycle(cycleId, userId);

    if (groceryItems.length > 0) {
      const itemsToInsert = groceryItems.map((item) => ({
        listId: newList[0].id,
        pantryItemId: item.pantryItemId!,
        requiredQty: item.totalRequired.toString(),
        onHandQty: item.inStock.toString(),
        toBuyQty: item.toBuy.toString(),
        status: "pending" as const,
      }));

      await db
        .insert(shoppingListItems)
        .values(itemsToInsert)
        .returning();
    }

    return newList[0];
  } catch (error) {
    console.error("[getOrCreateShoppingListForCycle] Error:", error);
    throw error;
  }
}

export async function getShoppingListWithItems(
  cycleId: string,
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
        eq(shoppingLists.id, shoppingListItems.listId),
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
        toBuyQty: parseFloat(item.toBuyQty || "0"),
        status: item.status!,
      }));

    return filteredResult;
  } catch (error) {
    console.error("[getShoppingListWithItems] Error:", error);
    throw error;
  }
}

export async function updateShoppingListItemStatus(
  itemId: string,
  status: "pending" | "bought" | "skipped",
) {
  return db
    .update(shoppingListItems)
    .set({ status })
    .where(eq(shoppingListItems.id, itemId))
    .returning();
}

export async function getShoppingListItemById(itemId: string) {
  const result = await db
    .select()
    .from(shoppingListItems)
    .where(eq(shoppingListItems.id, itemId))
    .limit(1);

  return result[0] || null;
}

export async function deleteShoppingListItems(listId: string) {
  try {
    const deleted = await db
      .delete(shoppingListItems)
      .where(eq(shoppingListItems.listId, listId))
      .returning();

    return deleted;
  } catch (error) {
    console.error("[deleteShoppingListItems] Error:", error);
    throw error;
  }
}

export async function deleteShoppingListItem(itemId: string) {
  try {
    const deleted = await db
      .delete(shoppingListItems)
      .where(eq(shoppingListItems.id, itemId))
      .returning();

    return deleted[0] || null;
  } catch (error) {
    console.error("[deleteShoppingListItem] Error:", error);
    throw error;
  }
}

export async function updateShoppingListForCycle(
  cycleId: string,
  userId: string,
) {
  try {
    const shoppingList = await getOrCreateShoppingListForCycle(cycleId, userId);

    const existingItems = await db
      .select({
        pantryItemId: shoppingListItems.pantryItemId,
        toBuyQty: shoppingListItems.toBuyQty,
      })
      .from(shoppingListItems)
      .where(eq(shoppingListItems.listId, shoppingList.id));

    const statusMap = new Map(
      existingItems.map((item) => [
        item.pantryItemId,
        {
          previousToBuyQty: parseFloat(item.toBuyQty || "0"),
        },
      ]),
    );

    await deleteShoppingListItems(shoppingList.id);

    const groceryItems = await getGroceryListForCycle(cycleId, userId);

    if (groceryItems.length > 0) {
      const itemsToInsert = groceryItems.map((item) => {
        const previousData = statusMap.get(item.pantryItemId!);
        const previousToBuyQty = previousData?.previousToBuyQty || 0;
        const currentToBuyQty = item.toBuy;

        let status: "pending" | "bought" | "skipped" = "pending";

        if (previousToBuyQty) {
          if (currentToBuyQty > previousToBuyQty) {
            status = "pending";
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
    console.error("[updateShoppingListForCycle] Error:", error);
    throw error;
  }
}
