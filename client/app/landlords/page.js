import LandlordsClient from "@/components/landlords/LandlordsClient";
import { authenticatedFetch } from "@/lib/server/auth";
import { adaptLandlords } from "@/lib/adapters/landlords";

export default async function LandlordsPage() {
  const [landlordsResponse, propertiesResponse] = await Promise.all([
    authenticatedFetch("landlords?limit=100"),
    authenticatedFetch("properties?limit=100"),
  ]);
  const landlords = landlordsResponse.ok ? adaptLandlords((await landlordsResponse.json()).items || []) : [];
  const properties = propertiesResponse.ok ? (await propertiesResponse.json()).items || [] : [];
  return <LandlordsClient landlords={landlords} properties={properties} />;
}
