import OverviewClient from "@/components/overview/OverviewClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptDashboard } from "@/lib/adapters/dashboard";
import { adaptLandlords } from "@/lib/adapters/landlords";
import { adaptUnits } from "@/lib/adapters/units";
import { adaptTenants } from "@/lib/adapters/tenants";
import { adaptProperties } from "@/lib/adapters/properties";
import { adaptMaintenanceRequests } from "@/lib/adapters/maintenance";

async function fetchJson(path, fallback) {
  const response = await authenticatedFetch(path);
  return response.ok ? response.json() : fallback;
}

export default async function OverviewPage() {
  const [payload, landlordsRes, propertiesRes, unitsRes, tenantsRes, leasesRes, maintenanceRes, financesRes] =
    await Promise.all([
      fetchJson("dashboard/agency", {}),
      fetchJson("landlords?limit=100", { items: [] }),
      fetchJson("properties?limit=100", { items: [] }),
      fetchJson("units?limit=100", { items: [] }),
      fetchJson("tenants?limit=100", { items: [] }),
      fetchJson("leases?limit=100", { items: [] }),
      fetchJson("maintenance?limit=100", { items: [] }),
      fetchJson("finances?limit=100", { items: [] }),
    ]);
  const dashboard = adaptDashboard(payload);
  return (
    <OverviewClient
      {...dashboard}
      landlords={adaptLandlords(landlordsRes.items || [])}
      properties={adaptProperties(propertiesRes.items || [])}
      units={adaptUnits(unitsRes.items || [])}
      tenants={adaptTenants(tenantsRes.items || [])}
      leases={leasesRes.items || []}
      maintenanceRequests={adaptMaintenanceRequests(maintenanceRes.items || [])}
      transactions={financesRes.items || []}
    />
  );
}
