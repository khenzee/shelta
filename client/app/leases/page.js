import LeasesClient from "@/components/leases/LeasesClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptTenants } from "@/lib/adapters/tenants";

export default async function LeasesPage() {
  const [leasesResponse, documentsResponse, tenantsResponse] = await Promise.all([
    authenticatedFetch("leases?limit=100"),
    authenticatedFetch("documents?limit=100"),
    authenticatedFetch("tenants?limit=100"),
  ]);
  const leases = leasesResponse.ok ? (await leasesResponse.json()).items || [] : [];
  const documents = documentsResponse.ok ? (await documentsResponse.json()).items || [] : [];
  const tenants = tenantsResponse.ok ? adaptTenants((await tenantsResponse.json()).items || []) : [];
  return <LeasesClient leases={leases} documents={documents} tenants={tenants} />;
}
