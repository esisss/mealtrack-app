import { Suspense } from 'react';
import { PlannerBoard } from '@/components/planner/PlannerBoard';
import { PlannerSkeleton } from '@/components/planner/PlannerSkeleton';
import {
  getCycleEntries,
  getOrCreateCurrentCycle,
  getRecipes,
} from '@/dal/dal';
import { requireAuthOrRedirect } from '@/lib/auth';

export default async function PlannerPage() {
  const user = await requireAuthOrRedirect();

  const today = new Date();
  const currentCycle = await getOrCreateCurrentCycle(user.id, today);
  const entries = await getCycleEntries(currentCycle.id);
  const recipes = await getRecipes(user.id);

  return (
    <div className="container mx-auto py-2">
      <Suspense fallback={<PlannerSkeleton />}>
        <PlannerBoard
          cycle={currentCycle}
          entries={entries}
          recipes={recipes}
          userId={user.id}
        />
      </Suspense>
    </div>
  );
}
