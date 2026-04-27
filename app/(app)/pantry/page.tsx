import { PantryBoard } from "@/components/pantry/items/PantryBoard";
import { getPantryItems } from "@/dal/pantry/dal.pantry";
import { getOrCreateCurrentCycle } from "@/dal/planner/dal.planner";
import { getShoppingListWithItems, getOrCreateShoppingListForCycle } from "@/dal/shopping/dal.shopping";
import { getCurrentStockWithDetails } from "@/dal/stock/dal.stock";
import { requireAuthOrRedirect } from "@/lib/auth";
import { PantryTab } from "@/components/pantry/pantryTab";

export default async function PantryPage() {
  const user = await requireAuthOrRedirect();

  console.log('[PantryPage] User:', user.id);

  const pantryItems = await getPantryItems(user.id);

  // Get or create current cycle
  const currentCycle = await getOrCreateCurrentCycle(user.id, new Date());

  // Get or create shopping list for the cycle
  const shoppingList = await getOrCreateShoppingListForCycle(currentCycle.id, user.id);

  // Get grocery items
  const groceryItems = await getShoppingListWithItems(currentCycle.id);
  // Get stock items
  const stockItems = await getCurrentStockWithDetails(user.id);

  if (!pantryItems || !currentCycle || !shoppingList || !groceryItems || !stockItems) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error loading pantry</h2>
          <p className="text-muted-foreground">An unknown error occurred</p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full flex items-center justify-center">
      <PantryTab items={pantryItems} groceryItems={groceryItems} stockItems={stockItems} cycleId={currentCycle.id} />
    </div>
  );


}
