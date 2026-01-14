import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return <div>Not authenticated</div>;
  }
  return (
    <div className="h-screen ">
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard user={{ id: currentUser?.id, displayName: currentUser?.displayName || "User" }} />
      </Suspense>
    </div>
  );
}
