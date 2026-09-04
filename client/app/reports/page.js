import ReportsClient from "@/components/reports/ReportsClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptLandlords } from "@/lib/adapters/landlords";
import { adaptProperties } from "@/lib/adapters/properties";
import { adaptTenants } from "@/lib/adapters/tenants";
import { adaptTransactions } from "@/lib/adapters/finances";
import { adaptRentCharges } from "@/lib/adapters/rent-schedule";
import { adaptMaintenanceRequests } from "@/lib/adapters/maintenance";
import { requireRole } from "@/lib/server/authorization";

export default async function ReportsPage() {
  await requireRole(["ADMIN"]);
  const [
    landlordsResponse,
    propertiesResponse,
    tenantsResponse,
    transactionsResponse,
    rentResponse,
    maintenanceResponse,
  ] = await Promise.all([
    authenticatedFetch("landlords?limit=100"),
    authenticatedFetch("properties?limit=100"),
    authenticatedFetch("tenants?limit=100"),
    authenticatedFetch("finances?limit=100"),
    authenticatedFetch("finances/rent-schedule?limit=100"),
    authenticatedFetch("maintenance?limit=100"),
  ]);
  const landlords = landlordsResponse.ok
    ? adaptLandlords((await landlordsResponse.json()).items || [])
    : [];
  const properties = propertiesResponse.ok
    ? adaptProperties((await propertiesResponse.json()).items || [])
    : [];
  const tenants = tenantsResponse.ok
    ? adaptTenants((await tenantsResponse.json()).items || [])
    : [];
  const transactions = transactionsResponse.ok
    ? adaptTransactions((await transactionsResponse.json()).items || [])
    : [];
  const rentSchedule = rentResponse.ok
    ? adaptRentCharges((await rentResponse.json()).items || [])
    : [];
  const maintenanceRequests = maintenanceResponse.ok
    ? adaptMaintenanceRequests((await maintenanceResponse.json()).items || [])
    : [];
  return (
    <ReportsClient
      landlords={landlords}
      properties={properties}
      tenants={tenants}
      transactions={transactions}
      rentSchedule={rentSchedule}
      maintenance={maintenanceRequests}
    />
  );
}
