import { PlannerBoard } from '@/components/planner/PlannerBoard';
import {
  getCycleEntries,
  getOrCreateCurrentCycle,
  getRecipes,
} from '@/dal/dal';
import { getCurrentUser } from '@/lib/auth';

export default async function PlannerPage() {
  const user = await getCurrentUser();
  if (!user) {
    return <div>Please log in</div>;
  }

  const today = new Date();
  const currentCycle = await getOrCreateCurrentCycle(user.id, today);
  const entries = await getCycleEntries(currentCycle.id);
  const recipes = await getRecipes(user.id);

  return (
    <div className="container mx-auto py-6">
      <PlannerBoard
        cycle={currentCycle}
        entries={entries}
        recipes={recipes}
      />
    </div>
  );
}
