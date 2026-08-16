import PropertiesClient from "@/components/properties/PropertiesClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptProperties } from "@/lib/adapters/properties";
import { adaptLandlords } from "@/lib/adapters/landlords";

export default async function PropertiesPage() {
  const [propertyResponse, landlordResponse] = await Promise.all([
    authenticatedFetch("properties?limit=100"),
    authenticatedFetch("landlords?limit=100"),
  ]);
  const properties = propertyResponse.ok ? adaptProperties((await propertyResponse.json()).items || []) : [];
  const landlords = landlordResponse.ok ? adaptLandlords((await landlordResponse.json()).items || []) : [];
  return <PropertiesClient properties={properties} landlords={landlords} />;
}
