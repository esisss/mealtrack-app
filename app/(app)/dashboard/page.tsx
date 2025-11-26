import { Dashboard } from "@/components/dashboard/Dashboard";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return <div>Not authenticated</div>;
  }
  return <div className="h-screen ">
    <Dashboard user={{ id: currentUser?.id, displayName: currentUser?.displayName || "User" }} />
  </div>;
}
