import FinancesClient from "@/components/finances/FinancesClient";
import { properties, rentSchedule, tenants, transactions } from "@/lib/mock-data";

export default function FinancesPage() {
  return (
    <FinancesClient
      transactions={transactions}
      rentSchedule={rentSchedule}
      tenants={tenants}
      properties={properties}
    />
  );
}
