import { PantryBoard } from "@/components/pantry/items/PantryBoard";
import { getPantryItems, getOrCreateCurrentCycle, getShoppingListWithItems, getOrCreateShoppingListForCycle } from "@/dal/dal";
import { getCurrentUser } from "@/lib/auth";
import { PantryTab } from "@/components/pantry/pantryTab";

export default async function PantryPage() {
  const user = await getCurrentUser();
  const pantryItems = await getPantryItems(user?.id || '');

  // Get or create current cycle
  const currentCycle = await getOrCreateCurrentCycle(user?.id || '', new Date());

  // Get or create shopping list for the cycle
  await getOrCreateShoppingListForCycle(currentCycle.id, user?.id || '');

  // Get grocery items
  const groceryItems = await getShoppingListWithItems(currentCycle.id);
  console.log(groceryItems);
  return (
    <div className="w-full flex items-center justify-center">
      <PantryTab items={pantryItems} groceryItems={groceryItems} cycleId={currentCycle.id} />
    </div>
  );
}
