import LeasesClient from "@/components/leases/LeasesClient";
import { documents, leases, tenants } from "@/lib/mock-data";

export default function LeasesPage() {
  return <LeasesClient leases={leases} documents={documents} tenants={tenants} />;
}
