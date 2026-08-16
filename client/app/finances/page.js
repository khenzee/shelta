import FinancesClient from "@/components/finances/FinancesClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptProperties } from "@/lib/adapters/properties";
import { adaptTenants } from "@/lib/adapters/tenants";
import { requireRole } from "@/lib/server/authorization";

export default async function FinancesPage() {
  await requireRole(["ADMIN"]);
  const [financeResponse, propertiesResponse, tenantsResponse] = await Promise.all([
    authenticatedFetch("finances?limit=100"),
    authenticatedFetch("properties?limit=100"),
    authenticatedFetch("tenants?limit=100"),
  ]);
  const transactions = financeResponse.ok ? (await financeResponse.json()).items || [] : [];
  const properties = propertiesResponse.ok ? adaptProperties((await propertiesResponse.json()).items || []) : [];
  const tenants = tenantsResponse.ok ? adaptTenants((await tenantsResponse.json()).items || []) : [];
  return (
    <FinancesClient
      transactions={transactions}
      rentSchedule={[]}
      tenants={tenants}
      properties={properties}
    />
  );
}
