

import RecipesBoard from "@/components/recipes/RecipesBoard";
import { getPantryItems, getRecipes } from "@/dal/dal";
import { pantryItems, recipes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { InferSelectModel } from "drizzle-orm";

type Recipe = InferSelectModel<typeof recipes>;
type PantryItem = InferSelectModel<typeof pantryItems>


export default async function RecipesPage() {
  const user = await getCurrentUser();
  const recipes: Recipe[] = await getRecipes(user ? user.id : "");
  //Fetch pantry items registered to use them down at recipe creation form (client component)
  const pantryItems: PantryItem[] = await getPantryItems(user ? user.id : "");
  return (
    <RecipesBoard recipes={recipes} pantryItems={pantryItems} />
  );
}