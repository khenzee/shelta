import UnitsClient from "@/components/units/UnitsClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptUnits } from "@/lib/adapters/units";
import { adaptProperties } from "@/lib/adapters/properties";

export default async function UnitsPage() {
  const [unitsResponse, propertiesResponse] = await Promise.all([
    authenticatedFetch("units?limit=100"),
    authenticatedFetch("properties?limit=100"),
  ]);
  const units = unitsResponse.ok ? adaptUnits((await unitsResponse.json()).items || []) : [];
  const properties = propertiesResponse.ok ? adaptProperties((await propertiesResponse.json()).items || []) : [];
  return <UnitsClient units={units} properties={properties} />;
}
