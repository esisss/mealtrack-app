"use server";

import {
  getOrCreateShoppingListForCycle,
  getShoppingListWithItems,
  updateShoppingListItemStatus,
  getShoppingListItemById,
} from "@/dal/shopping/dal.shopping";
import { addStockLot, getStockLotByItemId, deleteStockLotByLotId } from "@/dal/stock/dal.stock";
import { isNotAuthenticatedError, requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ActionResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export async function getGroceryListAction(cycleId: string) {
  try {
    console.log("[getGroceryListAction] Starting with cycleId:", cycleId);

    const user = await requireAuth();

    console.log("[getGroceryListAction] User authenticated:", user.id);

    const shoppingList = await getOrCreateShoppingListForCycle(
      cycleId,
      user.id,
    );
    console.log("[getGroceryListAction] Shopping list:", shoppingList.id);

    const items = await getShoppingListWithItems(cycleId);
    console.log("[getGroceryListAction] Retrieved items:", items.length);

    return {
      success: true,
      message: "Grocery list retrieved successfully",
      data: items,
    };
  } catch (error) {
    if (isNotAuthenticatedError(error)) {
      console.log("[getGroceryListAction] User not authenticated");
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("[getGroceryListAction] Error:", error);
    return {
      success: false,
      message: `Error getting grocery list: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export async function toggleGroceryItemStatusAction(
  itemId: string,
  currentStatus: "pending" | "bought" | "skipped",
  removeFromStock?: boolean,
) {
  try {
    const newStatus = currentStatus === "bought" ? "pending" : "bought";

    const user = await requireAuth();

    const item = await getShoppingListItemById(itemId);
    const lot = await getStockLotByItemId(item.pantryItemId);
    if (!item) {
      return {
        success: false,
        message: "Shopping list item not found",
      };
    }

    if (newStatus === "bought") {
      const quantityToBuy = parseFloat(item.toBuyQty);
      if (quantityToBuy > 0) {
        await addStockLot(user.id, item.pantryItemId, quantityToBuy);
        console.log(
          `[toggleGroceryItemStatusAction] Added ${quantityToBuy} to stock for item ${item.pantryItemId}`,
        );
      }
    }

    if (
      currentStatus === "bought" &&
      newStatus === "pending" &&
      removeFromStock
    ) {
      await deleteStockLotByLotId(lot.id);
      console.log(
        `[toggleGroceryItemStatusAction] Removed stock lot for id ${lot.id}`,
      );
    }

    await updateShoppingListItemStatus(itemId, newStatus);

    revalidatePath("/pantry");

    return {
      success: true,
      message: "Item status updated",
      data: { newStatus },
    };
  } catch (error) {
    if (isNotAuthenticatedError(error)) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("Error updating item status:", error);
    return {
      success: false,
      message: `Error updating item status: ${error}`,
    };
  }
}

export async function deleteGroceryItemAction(itemId: string) {
  try {
    await requireAuth();

    const { deleteShoppingListItem } = await import("@/dal/shopping/dal.shopping");
    const deleted = await deleteShoppingListItem(itemId);

    if (!deleted) {
      return {
        success: false,
        message: "Item not found",
      };
    }

    revalidatePath("/pantry");

    return {
      success: true,
      message: "Item deleted successfully",
    };
  } catch (error) {
    if (isNotAuthenticatedError(error)) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("Error deleting grocery item:", error);
    return {
      success: false,
      message: `Error deleting item: ${error}`,
    };
  }
}
