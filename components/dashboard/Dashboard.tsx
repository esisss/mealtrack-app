import { checkStockForRecipe, getCycleEntries, getRecipeById, getThisWeekCycle, getCookableRecipes, getExpiringStock, getLowStockItems, getConsumptionStreak } from "@/dal/dal";
import { MarkConsumption } from "./MarkConsumption"
import { CookableRecipes } from "./CookableRecipes";
import { QuickActions } from "./QuickActions";
import { ExpiringStock } from "./ExpiringStock";
import { LowStockAlert } from "./LowStockAlert";
import { StreakWidget } from "./StreakWidget";

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
    const expiringStock = await getExpiringStock(user.id);
    const lowStockItems = await getLowStockItems(user.id);
    const streak = await getConsumptionStreak(user.id);

    return (
        <div className="container mx-auto p-4 max-w-7xl">
            <header className="mb-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black tracking-tight text-foreground">
                        Welcome, <span className="text-primary">{user.displayName}</span>
                    </h1>
                </div>
                <QuickActions />
            </header>

            <div className="flex flex-col gap-8">
                {/* Top Row: Main focus and small widgets */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Next Meal Focus */}
                    <section className="flex-2 min-w-[300px] w-full h-full lg:w-auto">
                        <MarkConsumption
                            nextMeal={nextMealRecipe!}
                            mealPlanEntryId={nextEntry?.id!}
                            userId={user.id}
                            stockStatus={stockStatus}
                        />
                        <CookableRecipes recipes={cookableRecipes} />
                    </section>

                    {/* Quick Stats Column */}
                    <div className="flex-1 flex flex-col gap-6 w-full lg:w-auto">
                        <StreakWidget streak={streak} />
                        <div className="bg-sidebar/30 p-2 rounded-2xl space-y-8 my-2">
                            <ExpiringStock items={expiringStock} />
                            <LowStockAlert items={lowStockItems} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
