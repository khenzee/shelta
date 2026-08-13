import LandlordsClient from "@/components/landlords/LandlordsClient";
import { landlords, properties } from "@/lib/mock-data";

export default function LandlordsPage() {
  return <LandlordsClient landlords={landlords} properties={properties} />;
}
