
import { Suspense } from "react";
import RecipesBoard from "@/components/recipes/RecipesBoard";
import { RecipesSkeleton } from "@/components/recipes/RecipesSkeleton";
import { getPantryItems, getRecipes } from "@/dal/dal";
import { pantryItems, recipes } from "@/db/schema";
import { requireAuthOrRedirect } from "@/lib/auth";
import { InferSelectModel } from "drizzle-orm";

type Recipe = InferSelectModel<typeof recipes>;
type PantryItem = InferSelectModel<typeof pantryItems>


export default async function RecipesPage() {
  const user = await requireAuthOrRedirect();
  const recipes: Recipe[] = await getRecipes(user.id);
  //Fetch pantry items registered to use them down at recipe creation form (client component)
  const pantryItems: PantryItem[] = await getPantryItems(user.id);
  return (
    <Suspense fallback={<RecipesSkeleton />}>
      <RecipesBoard recipes={recipes} pantryItems={pantryItems} />
    </Suspense>
  );
}
