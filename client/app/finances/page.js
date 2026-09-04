import FinancesClient from "@/components/finances/FinancesClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptTransactions } from "@/lib/adapters/finances";
import { adaptRentCharges } from "@/lib/adapters/rent-schedule";
import { adaptProperties } from "@/lib/adapters/properties";
import { adaptTenants } from "@/lib/adapters/tenants";
import { adaptUnits } from "@/lib/adapters/units";
import { adaptLandlords } from "@/lib/adapters/landlords";
import { requireRole } from "@/lib/server/authorization";

export default async function FinancesPage() {
  await requireRole(["ADMIN"]);
  const [
    financeResponse,
    rentResponse,
    propertiesResponse,
    tenantsResponse,
    unitsResponse,
    landlordsResponse,
  ] = await Promise.all([
    authenticatedFetch("finances?limit=100"),
    authenticatedFetch("finances/rent-schedule?limit=100"),
    authenticatedFetch("properties?limit=100"),
    authenticatedFetch("tenants?limit=100"),
    authenticatedFetch("units?limit=100"),
    authenticatedFetch("landlords?limit=100"),
  ]);
  const transactions = financeResponse.ok
    ? adaptTransactions((await financeResponse.json()).items || [])
    : [];
  const rentSchedule = rentResponse.ok
    ? adaptRentCharges((await rentResponse.json()).items || [])
    : [];
  const properties = propertiesResponse.ok
    ? adaptProperties((await propertiesResponse.json()).items || [])
    : [];
  const tenants = tenantsResponse.ok
    ? adaptTenants((await tenantsResponse.json()).items || [])
    : [];
  const units = unitsResponse.ok ? adaptUnits((await unitsResponse.json()).items || []) : [];
  const landlords = landlordsResponse.ok
    ? adaptLandlords((await landlordsResponse.json()).items || [])
    : [];
  return (
    <FinancesClient
      transactions={transactions}
      rentSchedule={rentSchedule}
      tenants={tenants}
      properties={properties}
      units={units}
      landlords={landlords}
    />
  );
}
