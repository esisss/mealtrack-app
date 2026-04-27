"use server";
import {
  getCycleEntries,
  getOrCreateCurrentCycle,
  addMealPlanEntry,
  removeMealPlanEntry,
  getMealPlanEntry,
} from "@/dal/planner/dal.planner";
import { updateShoppingListForCycle } from "@/dal/shopping/dal.shopping";
import { isBeforeToday, parseLocalDate } from "@/lib/date-utils";
import { MealCycleInsert, MealCycleSelect, MealPlanEntryInsert } from "@/types";
import { revalidatePath } from "next/cache";
type ActionResponse<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
};

const actionWrapper = async <T>(
  action: () => Promise<T>,
  revalidatePaths: string[] = [],
): Promise<ActionResponse<T>> => {
  try {
    const data = await action();
    revalidatePaths.forEach((path) => revalidatePath(path));
    return { success: true, message: "Success", data };
  } catch (error: any) {
    console.error("Action error:", error);
    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
    };
  }
};

export const getOrCreateCycle = async (
  userId: string,
): Promise<ActionResponse<MealCycleInsert>> => {
  return actionWrapper(
    async () => await getOrCreateCurrentCycle(userId, new Date()),
  );
};
export const addMealPlanEntryAction = async (
  entry: MealPlanEntryInsert,
  userId: string,
): Promise<ActionResponse<MealPlanEntryInsert>> => {
  const entryDate = parseLocalDate(entry.day);
  if (isBeforeToday(entryDate)) {
    return { success: false, message: "Cannot add entries to past days." };
  }

  return actionWrapper(async () => {
    const result = await addMealPlanEntry(entry);

    await updateShoppingListForCycle(entry.cycleId, userId);

    return result[0];
  }, ["/planner", "/pantry"]);
};
export const removeMealPlanEntryAction = async (
  entryId: string,
  cycleId: string,
  userId: string,
): Promise<ActionResponse> => {
  const entry = await getMealPlanEntry(entryId);
  if (entry.length > 0) {
    const entryDate = parseLocalDate(entry[0].day);
    if (isBeforeToday(entryDate)) {
      return {
        success: false,
        message: "Cannot remove entries from past days.",
      };
    }
  }

  return actionWrapper(async () => {
    await removeMealPlanEntry(entryId);

    await updateShoppingListForCycle(cycleId, userId);

    return undefined;
  }, ["/planner", "/pantry"]);
};
