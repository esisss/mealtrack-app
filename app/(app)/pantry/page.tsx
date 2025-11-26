import { PantryBoard } from "@/components/pantry/PantryBoard";
import { getPantryItems } from "@/dal/dal";
import { getCurrentUser } from "@/lib/auth";

export default async function PantryPage() {
  const user = await getCurrentUser();
  const pantryItems = await getPantryItems(user?.id || ''); // Placeholder for pantry items data
  return (
    <div>
      <PantryBoard pantryItems={pantryItems} />
    </div>
  );
}
