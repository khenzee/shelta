import MaintenanceClient from "@/components/maintenance/MaintenanceClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptProperties } from "@/lib/adapters/properties";
import { adaptTenants } from "@/lib/adapters/tenants";

export default async function MaintenancePage() {
  const [requestsResponse, propertiesResponse, tenantsResponse, employeesResponse] = await Promise.all([
    authenticatedFetch("maintenance?limit=100"),
    authenticatedFetch("properties?limit=100"),
    authenticatedFetch("tenants?limit=100"),
    authenticatedFetch("employees?limit=100"),
  ]);
  const maintenanceRequests = requestsResponse.ok ? (await requestsResponse.json()).items || [] : [];
  const properties = propertiesResponse.ok ? adaptProperties((await propertiesResponse.json()).items || []) : [];
  const tenants = tenantsResponse.ok ? adaptTenants((await tenantsResponse.json()).items || []) : [];
  const employees = employeesResponse.ok ? (await employeesResponse.json()).items || [] : [];
  return (
    <MaintenanceClient
      requests={maintenanceRequests}
      properties={properties}
      tenants={tenants}
      employees={employees}
    />
  );
}
