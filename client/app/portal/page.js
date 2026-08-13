import LandlordPortal from "@/components/portal/LandlordPortal";
import {
  documents,
  landlords,
  maintenanceRequests,
  properties,
  rentSchedule,
  tenants,
  transactions,
} from "@/lib/mock-data";

export default function PortalPage() {
  const landlord = landlords.find((item) => item.id === "LL-001");
  const belongsToLandlord = (item) => item.landlord === landlord.name;

  return (
    <LandlordPortal
      landlord={landlord}
      properties={properties.filter(belongsToLandlord)}
      tenants={tenants.filter(belongsToLandlord)}
      transactions={transactions.filter(belongsToLandlord)}
      rentSchedule={rentSchedule.filter(belongsToLandlord)}
      maintenance={maintenanceRequests.filter(belongsToLandlord)}
      documents={documents.filter(belongsToLandlord)}
    />
  );
}
