import { units, properties } from "@/lib/mock-data";
import UnitsClient from "@/components/units/UnitsClient";

export default function UnitsPage() {
  // Simulating server data fetch
  return <UnitsClient units={units} properties={properties} />;
}
