import TenantsClient from "@/components/tenants/TenantsClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptTenants } from "@/lib/adapters/tenants";
import { adaptLandlords } from "@/lib/adapters/landlords";
import { adaptProperties } from "@/lib/adapters/properties";
import { adaptUnits } from "@/lib/adapters/units";

export default async function TenantsPage() {
  const [tenantResponse, landlordResponse, propertyResponse, unitResponse] = await Promise.all([
    authenticatedFetch("tenants?limit=100"),
    authenticatedFetch("landlords?limit=100"),
    authenticatedFetch("properties?limit=100"),
    authenticatedFetch("units?limit=100"),
  ]);
  const tenants = tenantResponse.ok ? adaptTenants((await tenantResponse.json()).items || []) : [];
  const landlords = landlordResponse.ok ? adaptLandlords((await landlordResponse.json()).items || []) : [];
  const properties = propertyResponse.ok ? adaptProperties((await propertyResponse.json()).items || []) : [];
  const units = unitResponse.ok ? adaptUnits((await unitResponse.json()).items || []) : [];
  return <TenantsClient tenants={tenants} landlords={landlords} properties={properties} units={units} />;
}
