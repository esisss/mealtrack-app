"use server";
import { pantryItems } from "@/db/schema";
import createDB from "../dal";
import { eq } from "drizzle-orm";
import { type InferInsertModel } from "drizzle-orm";

const db = await createDB();

type PantryItem = InferInsertModel<typeof pantryItems>;

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
