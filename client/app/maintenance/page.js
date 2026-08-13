import MaintenanceClient from "@/components/maintenance/MaintenanceClient";
import { employees, maintenanceRequests, properties, tenants } from "@/lib/mock-data";

export default function MaintenancePage() {
  return (
    <MaintenanceClient
      requests={maintenanceRequests}
      properties={properties}
      tenants={tenants}
      employees={employees}
    />
  );
}
