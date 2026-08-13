import { properties } from "@/lib/mock-data";
import PropertiesClient from "@/components/properties/PropertiesClient";

export default function PropertiesPage() {
  // Simulating server data fetch
  return <PropertiesClient properties={properties} />;
}
