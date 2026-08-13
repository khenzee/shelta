import TenantsClient from "@/components/tenants/TenantsClient";
import { tenants } from "@/lib/mock-data";

export default function TenantsPage() {
  return <TenantsClient tenants={tenants} />;
}
