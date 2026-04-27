"use server";
import { addPantryItems, getPantryItems } from "@/dal/pantry/dal.pantry";
import { pantryItems } from "@/db/schema";
import { isNotAuthenticatedError, requireAuth } from "@/lib/auth";
import { checkArrayIncludesNewArrayBy } from "@/utils/checkArrayIncludesNewArrayBy";
import { InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type PantryItem = InferInsertModel<typeof pantryItems>;

export const addNewPantryItemsAction = async (pantryItems: PantryItem[]) => {
  try {
    const user = await requireAuth();
    const existingPantryItems = await getPantryItems(user.id);
    const newPantryItems = checkArrayIncludesNewArrayBy(
      existingPantryItems,
      pantryItems,
      "name",
    ).map((item) => ({ ...item, userId: user.id }));
    if (newPantryItems.length === 0) {
      return {
        success: false,
        message: "No new pantry items to add",
        items: [],
      };
    }

    const addedItems = await addPantryItems(newPantryItems);
    revalidatePath("/pantry");
    return {
      success: true,
      message: "Pantry items added successfully",
      items: addedItems,
    };
  } catch (error) {
    if (isNotAuthenticatedError(error)) {
      return {
        success: false,
        message: error.message,
        items: [],
      };
    }

    console.error("Error adding pantry items:", error);
    return {
      success: false,
      message: `Error adding pantry items: ${error}`,
      items: [],
    };
  }
};
