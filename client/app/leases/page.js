import LeasesClient from "@/components/leases/LeasesClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptLeases } from "@/lib/adapters/leases";
import { adaptDocuments } from "@/lib/adapters/documents";
import { adaptTenants } from "@/lib/adapters/tenants";
import { adaptUnits } from "@/lib/adapters/units";

export default async function LeasesPage() {
  const [leasesResponse, documentsResponse, tenantsResponse, unitsResponse] = await Promise.all([
    authenticatedFetch("leases?limit=100"),
    authenticatedFetch("documents?limit=100"),
    authenticatedFetch("tenants?limit=100"),
    authenticatedFetch("units?limit=100"),
  ]);
  const leases = leasesResponse.ok ? adaptLeases((await leasesResponse.json()).items || []) : [];
  const documents = documentsResponse.ok
    ? adaptDocuments((await documentsResponse.json()).items || [])
    : [];
  const tenants = tenantsResponse.ok
    ? adaptTenants((await tenantsResponse.json()).items || [])
    : [];
  const units = unitsResponse.ok ? adaptUnits((await unitsResponse.json()).items || []) : [];
  return <LeasesClient leases={leases} documents={documents} tenants={tenants} units={units} />;
}
