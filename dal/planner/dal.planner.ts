"use server";
import { mealCycles, mealPlanEntries, recipes } from "@/db/schema";
import { formatLocalDate } from "@/lib/date-utils";
import createDB from "../dal";
import { and, eq, gte, lte } from "drizzle-orm";
import { MealCycleSelect, MealPlanEntryInsert } from "@/types";

const db = await createDB();

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
        lte(mealCycles.endDate, endStr),
      ),
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
      status: "planning",
    })
    .returning();

  return newCycle[0];
}

export async function getThisWeekCycle(
  userId: string,
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
        lte(mealCycles.endDate, endStr),
      ),
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
      imageUrl: recipes.imageUrl,
      notes: recipes.notes,
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
