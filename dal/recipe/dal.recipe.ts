"use server";
import { pantryItems, recipeIngredients, recipes } from "@/db/schema";
import createDB from "../dal";
import { desc, eq } from "drizzle-orm";
import {
  type RecipeIngredientInsert,
  type RecipeInsert,
} from "@/types";

const db = await createDB();

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
  recipe: Partial<RecipeInsert>,
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
  items: RecipeIngredientInsert[],
) => {
  await deleteRecipeIngredients(recipeId);
  if (items.length > 0) {
    return db.insert(recipeIngredients).values(items).returning();
  }
  return [];
};
