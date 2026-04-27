"use server";
import {
  consumptionEvents,
  mealConsumptions,
  mealCycles,
  mealPlanEntries,
  pantryItems,
  recipeIngredients,
  recipes,
  stockLots,
} from "@/db/schema";
import createDB from "../dal";
import { desc, eq, gte, lte, sql as sqlAgg, and, inArray } from "drizzle-orm";
import { formatLocalDate } from "@/lib/date-utils";
import { type ConsumptionEventInsert } from "@/types";
import { getRecipeIngredients } from "@/dal/recipe/dal.recipe";
import { getCurrentStock } from "@/dal/shopping/dal.shopping";

const db = await createDB();

export async function markMealConsumption(
  userId: string,
  mealPlanEntryId: string,
  notes?: string,
) {
  try {
    const entry = await db
      .select()
      .from(mealPlanEntries)
      .where(eq(mealPlanEntries.id, mealPlanEntryId))
      .limit(1);

    if (!entry[0]) {
      throw new Error("Meal plan entry not found");
    }

    await db
      .update(mealPlanEntries)
      .set({ done: true })
      .where(eq(mealPlanEntries.id, mealPlanEntryId));

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

    const ingredients = await getRecipeIngredients(entry[0].recipeId);

    if (ingredients.length > 0) {
      const servings = parseFloat(entry[0].servings || "1");

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
    console.error("[markMealConsumption] Error:", error);
    throw error;
  }
}

export async function getRecentMealConsumptions(
  userId: string,
  days: number = 7,
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
          gte(mealConsumptions.consumedAt, startDate),
        ),
      )
      .orderBy(desc(mealConsumptions.consumedAt));
  } catch (error) {
    console.error("[getRecentMealConsumptions] Error:", error);
    throw error;
  }
}

export async function getCurrentWeekProgress(userId: string, cycleId: string) {
  try {
    const result = await db
      .select({
        totalPlanned: sqlAgg<number>`COUNT(${mealPlanEntries.id})`.as(
          "total_planned",
        ),
        totalCompleted:
          sqlAgg<number>`COUNT(CASE WHEN ${mealPlanEntries.done} = true THEN 1 END)`.as(
            "total_completed",
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
    console.error("[getCurrentWeekProgress] Error:", error);
    throw error;
  }
}

export async function getFavoriteRecipes(userId: string, limit: number = 10) {
  try {
    return db
      .select({
        recipeId: recipes.id,
        recipeName: recipes.name,
        timesEaten: sqlAgg<number>`COUNT(${mealConsumptions.id})`.as(
          "times_eaten",
        ),
        lastEaten: sqlAgg<Date>`MAX(${mealConsumptions.consumedAt})`.as(
          "last_eaten",
        ),
      })
      .from(mealConsumptions)
      .leftJoin(recipes, eq(mealConsumptions.recipeId, recipes.id))
      .where(eq(mealConsumptions.userId, userId))
      .groupBy(recipes.id, recipes.name)
      .orderBy(desc(sqlAgg`COUNT(${mealConsumptions.id})`))
      .limit(limit);
  } catch (error) {
    console.error("[getFavoriteRecipes] Error:", error);
    throw error;
  }
}

export async function checkStockForRecipe(
  userId: string,
  recipeId: string,
  servings: number = 1,
) {
  try {
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

    const stock = await getCurrentStock(userId);
    const stockMap = new Map(
      stock.map((s) => [s.pantryItemId, parseFloat(s.totalInStock || "0")]),
    );

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
    console.error("[checkStockForRecipe] Error:", error);
    throw error;
  }
}

export async function getCookableRecipes(userId: string) {
  try {
    const { getRecipes } = await import("@/dal/recipe/dal.recipe");
    const userRecipes = await getRecipes(userId);
    if (userRecipes.length === 0) return [];

    const recipeIds = userRecipes.map((r) => r.id);
    const allIngredients = await db
      .select({
        recipeId: recipeIngredients.recipeId,
        pantryItemId: recipeIngredients.pantryItemId,
        qtyPerServing: recipeIngredients.qtyPerServing,
      })
      .from(recipeIngredients)
      .where(inArray(recipeIngredients.recipeId, recipeIds));

    const stock = await getCurrentStock(userId);
    const stockMap = new Map(
      stock.map((s) => [s.pantryItemId, parseFloat(s.totalInStock || "0")]),
    );

    const ingredientsByRecipe = new Map<string, typeof allIngredients>();
    for (const ing of allIngredients) {
      const existing = ingredientsByRecipe.get(ing.recipeId) || [];
      existing.push(ing);
      ingredientsByRecipe.set(ing.recipeId, existing);
    }

    const cookableRecipes = userRecipes.filter((recipe) => {
      const ingredients = ingredientsByRecipe.get(recipe.id) || [];
      if (ingredients.length === 0) return false;

      return ingredients.every((ing) => {
        const available = stockMap.get(ing.pantryItemId) || 0;
        const required = parseFloat(ing.qtyPerServing);
        return available >= required;
      });
    });

    return cookableRecipes;
  } catch (error) {
    console.error("[getCookableRecipes] Error:", error);
    throw error;
  }
}

export async function getExpiringStock(
  userId: string,
  daysThreshold: number = 3,
) {
  try {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + daysThreshold);

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
          lte(stockLots.expiresAt, thresholdStr),
        ),
      )
      .orderBy(stockLots.expiresAt);
  } catch (error) {
    console.error("[getExpiringStock] Error:", error);
    throw error;
  }
}

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
				`.as("total_in_stock"),
      })
      .from(pantryItems)
      .leftJoin(stockLots, eq(pantryItems.id, stockLots.pantryItemId))
      .where(
        and(
          eq(pantryItems.userId, userId),
          sqlAgg`CAST(${pantryItems.fixedBuyQty} AS NUMERIC) > 0`,
        ),
      )
      .groupBy(
        pantryItems.id,
        pantryItems.name,
        pantryItems.baseUnit,
        pantryItems.fixedBuyQty,
      )
      .having(
        sqlAgg`COALESCE(SUM(CAST(${stockLots.qtyRemaining} AS NUMERIC)), 0) <= 0.2 * CAST(${pantryItems.fixedBuyQty} AS NUMERIC)`,
      );
  } catch (error) {
    console.error("[getLowStockItems] Error:", error);
    throw error;
  }
}

export async function getConsumptionStreak(userId: string) {
  try {
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

    const dayStatus = new Map<string, boolean>();
    for (const entry of entries) {
      const current = dayStatus.get(entry.day) ?? true;
      dayStatus.set(entry.day, current && entry.done);
    }

    const sortedDates = Array.from(dayStatus.keys()).sort((a, b) =>
      b.localeCompare(a),
    );

    const today = formatLocalDate(new Date());

    let streak = 0;

    for (const date of sortedDates) {
      if (date > today) continue;

      const isDone = dayStatus.get(date);

      if (isDone) {
        streak++;
      } else {
        if (date < today) {
          break;
        }
      }
    }

    return streak;
  } catch (error) {
    console.error("[getConsumptionStreak] Error:", error);
    throw error;
  }
}
