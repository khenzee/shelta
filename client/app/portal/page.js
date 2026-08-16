import LandlordPortal from "@/components/portal/LandlordPortal";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptProperties } from "@/lib/adapters/properties";
import { adaptTenants } from "@/lib/adapters/tenants";

export default async function PortalPage() {
  const [propertiesResponse, tenantsResponse, leasesResponse, financesResponse, maintenanceResponse] = await Promise.all([
    authenticatedFetch("landlord-portal/properties"),
    authenticatedFetch("landlord-portal/tenants"),
    authenticatedFetch("landlord-portal/leases"),
    authenticatedFetch("landlord-portal/finances"),
    authenticatedFetch("landlord-portal/maintenance"),
  ]);
  const properties = propertiesResponse.ok ? adaptProperties((await propertiesResponse.json()).items || []) : [];
  const tenants = tenantsResponse.ok ? adaptTenants((await tenantsResponse.json()).items || []) : [];
  const leases = leasesResponse.ok ? (await leasesResponse.json()).items || [] : [];
  const transactions = financesResponse.ok ? (await financesResponse.json()).items || [] : [];
  const maintenance = maintenanceResponse.ok ? (await maintenanceResponse.json()).items || [] : [];
  const landlord = properties[0]?.landlord
    ? { name: properties[0].landlord, id: properties[0].landlordId }
    : { name: "Landlord portal", id: null };

  return (
    <LandlordPortal
      landlord={landlord}
      properties={properties}
      tenants={tenants}
      leases={leases}
      transactions={transactions}
      rentSchedule={[]}
      maintenance={maintenance}
      documents={[]}
    />
  );
}
