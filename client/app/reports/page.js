import ReportsClient from "@/components/reports/ReportsClient";
import {
  landlords,
  maintenanceRequests,
  properties,
  rentSchedule,
  tenants,
  transactions,
} from "@/lib/mock-data";

export default function ReportsPage() {
  return (
    <ReportsClient
      landlords={landlords}
      properties={properties}
      tenants={tenants}
      transactions={transactions}
      rentSchedule={rentSchedule}
      maintenance={maintenanceRequests}
    />
  );
}
