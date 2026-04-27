import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { requireAuthOrRedirect } from "@/lib/auth";

export default async function DashboardPage() {
  const currentUser = await requireAuthOrRedirect();
  return (
    <div className="h-screen ">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard user={{ id: currentUser?.id, displayName: currentUser?.displayName || "User" }} />
      </Suspense>
    </div>
  );
}
