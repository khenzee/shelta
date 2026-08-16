import OverviewClient from "@/components/overview/OverviewClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptDashboard } from "@/lib/adapters/dashboard";

export default async function OverviewPage() {
  const response = await authenticatedFetch("dashboard/agency");
  const dashboard = response.ok ? adaptDashboard(await response.json()) : adaptDashboard();
  return <OverviewClient {...dashboard} />;
}
