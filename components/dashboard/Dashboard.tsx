import { checkStockForRecipe, getCycleEntries, getRecipeById, getThisWeekCycle, getCookableRecipes } from "@/dal/dal";
import { MarkConsumption } from "./MarkConsumption"
import { CookableRecipes } from "./CookableRecipes";

export const Dashboard = async ({ user }: { user: { id: string, displayName: string } }) => {
    const thisWeekCycle = await getThisWeekCycle(user.id);
    const cycleEntries = await getCycleEntries(thisWeekCycle?.id!);
    const nextEntry = cycleEntries.find((entry) => entry.done === false);
    const nextMealRecipeId = nextEntry?.recipeId;
    const nextMealRecipe = nextMealRecipeId ? await getRecipeById(nextMealRecipeId) : null;
    const stockStatus = (nextEntry && nextMealRecipeId)
        ? await checkStockForRecipe(user.id, nextMealRecipeId, parseFloat(nextEntry.servings || '1'))
        : { hasEnoughStock: true, missingIngredients: [] };
    const cookableRecipes = await getCookableRecipes(user.id);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
            </div>
            <MarkConsumption
                nextMeal={nextMealRecipe!}
                mealPlanEntryId={nextEntry?.id!}
                userId={user.id}
                stockStatus={stockStatus}
            />

            <CookableRecipes recipes={cookableRecipes} />
        </div >
    )
}
