"use server";

import {
  getCurrentStockWithDetails,
  addStockLot,
  adjustStockQuantity,
  deleteStockLotsByItem,
} from "@/dal/stock/dal.stock";
import { updateShoppingListForCycle } from "@/dal/shopping/dal.shopping";
import { isNotAuthenticatedError, requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ActionResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export async function getStockAction() {
  try {
    console.log("[getStockAction] Starting");

    const user = await requireAuth();

    console.log("[getStockAction] User authenticated:", user.id);

    const stockItems = await getCurrentStockWithDetails(user.id);
    console.log("[getStockAction] Retrieved stock items:", stockItems.length);

    return {
      success: true,
      message: "Stock retrieved successfully",
      data: stockItems,
    };
  } catch (error) {
    if (isNotAuthenticatedError(error)) {
      console.log("[getStockAction] User not authenticated");
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("[getStockAction] Error:", error);
    return {
      success: false,
      message: `Error getting stock: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export async function addStockLotAction(
  pantryItemId: string,
  quantity: number,
  expiresAt?: Date,
  cycleId?: string,
) {
  try {
    console.log("[addStockLotAction] Adding stock:", {
      pantryItemId,
      quantity,
      expiresAt,
    });

    const user = await requireAuth();

    const newLot = await addStockLot(
      user.id,
      pantryItemId,
      quantity,
      expiresAt,
    );

    if (cycleId) {
      await updateShoppingListForCycle(cycleId, user.id);
    }

    revalidatePath("/pantry");

    return {
      success: true,
      message: "Stock added successfully",
      data: newLot,
    };
  } catch (error) {
    if (isNotAuthenticatedError(error)) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("[addStockLotAction] Error:", error);
    return {
      success: false,
      message: `Error adding stock: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export async function adjustStockAction(lotId: string, newQuantity: number) {
  try {
    console.log("[adjustStockAction] Adjusting:", { lotId, newQuantity });

    const updated = await adjustStockQuantity(lotId, newQuantity);

    revalidatePath("/pantry");

    return {
      success: true,
      message: "Stock adjusted successfully",
      data: updated,
    };
  } catch (error) {
    console.error("[adjustStockAction] Error:", error);
    return {
      success: false,
      message: `Error adjusting stock: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export async function deleteStockLotAction(
  pantryItemId: string,
  cycleId: string,
) {
  try {
    console.log("[deleteStockLotAction] Deleting stock for:", pantryItemId);

    const user = await requireAuth();

    const deleted = await deleteStockLotsByItem(user.id, pantryItemId);

    await updateShoppingListForCycle(cycleId, user.id);
    console.log(
      "[deleteStockLotAction] Shopping list updated for cycle:",
      cycleId,
    );

    revalidatePath("/pantry");

    return {
      success: true,
      message: "Stock deleted successfully",
      data: deleted,
    };
  } catch (error) {
    if (isNotAuthenticatedError(error)) {
      return {
        success: false,
        message: error.message,
      };
    }

    console.error("[deleteStockLotAction] Error:", error);
    return {
      success: false,
      message: `Error deleting stock: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
