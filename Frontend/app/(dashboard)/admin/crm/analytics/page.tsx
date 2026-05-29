// app/(dashboard)/admin/crm/analytics/page.tsx
import { redirect } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { ANALYTICS_ROLES } from "@/lib/roles";
import { requireAuth } from "@/lib/serverAuth";

export default async function AnalyticsPage() {
  const auth = await requireAuth(ANALYTICS_ROLES);
  if (!auth.ok) {
    redirect(auth.response.status === 401 ? "/login" : "/");
  }

  return (
    <>
      <Topbar title="CRM Analytics" />
      <div className="flex-1 overflow-y-auto">
        <AnalyticsDashboard />
      </div>
    </>
  );
}
