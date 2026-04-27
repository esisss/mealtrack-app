"use server";
import { pantryItems, stockLots } from "@/db/schema";
import createDB from "../dal";
import { eq, sql as sqlAgg, and } from "drizzle-orm";
import { type StockItem } from "@/types";

const db = await createDB();

export async function getCurrentStockWithDetails(
  userId: string,
): Promise<StockItem[]> {
  try {
    const result = await db
      .select({
        pantryItemId: pantryItems.id,
        ingredientName: pantryItems.name,
        baseUnit: pantryItems.baseUnit,
        totalInStock: sqlAgg<string>`
					COALESCE(SUM(CAST(${stockLots.qtyRemaining} AS NUMERIC)), 0)
				`.as("total_in_stock"),
        lotCount: sqlAgg<number>`COUNT(${stockLots.id})`.as("lot_count"),
        earliestExpiry: sqlAgg<Date | null>`MIN(${stockLots.expiresAt})`.as(
          "earliest_expiry",
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
        totalInStock: parseFloat(item.totalInStock || "0"),
        lotCount: item.lotCount,
        earliestExpiry: item.earliestExpiry,
      }));

    return stockItems;
  } catch (error) {
    console.error("[getCurrentStockWithDetails] Error:", error);
    throw error;
  }
}

export async function addStockLot(
  userId: string,
  pantryItemId: string,
  quantity: number,
  expiresAt?: Date,
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
    console.error("[addStockLot] Error:", error);
    throw error;
  }
}

export async function adjustStockQuantity(lotId: string, newQuantity: number) {
  try {
    const updated = await db
      .update(stockLots)
      .set({ qtyRemaining: newQuantity.toString() })
      .where(eq(stockLots.id, lotId))
      .returning();

    return updated[0];
  } catch (error) {
    console.error("[adjustStockQuantity] Error:", error);
    throw error;
  }
}

export async function getStockLotsByItem(userId: string, pantryItemId: string) {
  try {
    const lots = await db
      .select()
      .from(stockLots)
      .where(
        and(
          eq(stockLots.userId, userId),
          eq(stockLots.pantryItemId, pantryItemId),
        ),
      )
      .orderBy(stockLots.acquiredAt);

    return lots;
  } catch (error) {
    console.error("[getStockLotsByItem] Error:", error);
    throw error;
  }
}

export async function getStockLotByItemId(pantryItemId: string) {
  try {
    const lot = await db
      .select()
      .from(stockLots)
      .where(eq(stockLots.pantryItemId, pantryItemId))
      .limit(1);
    return lot[0];
  } catch (error) {
    console.error("[getStockLotIdByItemId] Error:", error);
    throw error;
  }
}

export async function deleteStockLotsByItem(
  userId: string,
  pantryItemId: string,
) {
  try {
    const deleted = await db
      .delete(stockLots)
      .where(
        and(
          eq(stockLots.userId, userId),
          eq(stockLots.pantryItemId, pantryItemId),
        ),
      )
      .returning();

    return deleted;
  } catch (error) {
    console.error("[deleteStockLotsByItem] Error:", error);
    throw error;
  }
}

export async function deleteStockLotByLotId(lotId: string) {
  try {
    const deleted = await db
      .delete(stockLots)
      .where(eq(stockLots.id, lotId))
      .returning();

    return deleted;
  } catch (error) {
    console.error("[deleteStockLotByLotId] Error:", error);
    throw error;
  }
}
