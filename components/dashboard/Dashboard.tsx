import { checkStockForRecipe, getCookableRecipes, getExpiringStock, getLowStockItems, getConsumptionStreak } from "@/dal/consumption/dal.consumption";
import { getCycleEntries } from "@/dal/planner/dal.planner";
import { getThisWeekCycle } from "@/dal/planner/dal.planner";
import { getRecipeById } from "@/dal/recipe/dal.recipe";
import { MarkConsumption } from "./MarkConsumption"
import { CookableRecipes } from "./CookableRecipes";
import { QuickActions } from "./QuickActions";
import { ExpiringStock } from "./ExpiringStock";
import { LowStockAlert } from "./LowStockAlert";
import { StreakWidget } from "./StreakWidget";
import { formatLocalDate, getTodayLocal } from "@/lib/date-utils";

export const Dashboard = async ({ user }: { user: { id: string, displayName: string } }) => {
    const thisWeekCycle = await getThisWeekCycle(user.id);
    const cycleEntries = await getCycleEntries(thisWeekCycle?.id!);

    const todayStr = formatLocalDate(getTodayLocal());
    const todayEntries = (cycleEntries || [])
        .filter(entry => entry.day === todayStr)
        .sort((a, b) => {
            const order: Record<string, number> = { breakfast: 1, lunch: 2, dinner: 3, snack: 4 };
            return (order[a.mealType as string] || 5) - (order[b.mealType as string] || 5);
        });

    const todayMeals = await Promise.all(todayEntries.map(async (entry) => {
        const stockStatus = await checkStockForRecipe(user.id, entry.recipeId, parseFloat(entry.servings || '1'));
        return {
            ...entry,
            stockStatus
        };
    }));

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
                            todayMeals={todayMeals}
                            userId={user.id}
                        />
                        <CookableRecipes recipes={cookableRecipes} />
                    </section>

                    {/* Quick Stats Column */}
                    <div className="flex-1 flex flex-col gap-6 w-full lg:w-auto">
                        <StreakWidget streak={streak} />
                        <div className="p-2 rounded-2xl space-y-8 my-2">
                            <ExpiringStock items={expiringStock} />
                            <LowStockAlert items={lowStockItems} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
