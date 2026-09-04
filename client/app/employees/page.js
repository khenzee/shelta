import TeamClient from "@/components/employees/TeamClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptProperties } from "@/lib/adapters/properties";
import { adaptEmployees } from "@/lib/adapters/employees";
import { requireRole } from "@/lib/server/authorization";

export default async function EmployeesPage() {
  await requireRole(["ADMIN", "MANAGER"]);
  const [employeesResponse, propertiesResponse, rolesResponse] = await Promise.all([
    authenticatedFetch("employees?limit=100"),
    authenticatedFetch("properties?limit=100"),
    authenticatedFetch("employees/roles/options"),
  ]);
  const employees = employeesResponse.ok
    ? adaptEmployees((await employeesResponse.json()).items || [])
    : [];
  const properties = propertiesResponse.ok
    ? adaptProperties((await propertiesResponse.json()).items || [])
    : [];
  const roles = rolesResponse.ok
    ? ((await rolesResponse.json()).items || []).filter((role) => role.name !== "ADMIN")
    : [];
  return <TeamClient employees={employees} properties={properties} roles={roles} />;
}
