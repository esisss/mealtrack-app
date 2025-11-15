import RecipesBoard from "@/components/recipes/RecipesBoard";
import { getPantryItems, getRecipes } from "@/dal/dal";
import { pantryItems, recipes } from "@/db/schema";
import { stackServerApp } from "@/stack/server";
import { InferSelectModel } from "drizzle-orm";

type Recipe = InferSelectModel<typeof recipes>;
type PantryItem = InferSelectModel<typeof pantryItems>


export default async function RecipesPage() {
  const user = await stackServerApp.getUser();
  const recipes: Recipe[] = await getRecipes(user ? user.id : "");
  const pantryItems: PantryItem[] = await getPantryItems(user ? user.id : "");
  return (
    <RecipesBoard recipes={recipes} pantryItems={pantryItems} />
  );
}