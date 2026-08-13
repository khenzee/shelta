import TeamClient from "@/components/employees/TeamClient";
import { employees, properties, rolePermissions } from "@/lib/mock-data";

export default function EmployeesPage() {
  return (
    <TeamClient employees={employees} properties={properties} rolePermissions={rolePermissions} />
  );
}
