"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CreateTenantDialog({ landlords, properties, units, onClose }) {
  const router = useRouter();
  const [landlordId, setLandlordId] = useState(landlords[0]?.id || "");
  const availableProperties = properties.filter((item) => item.landlordId === landlordId);
  const [propertyId, setPropertyId] = useState(availableProperties[0]?.id || "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function changeLandlord(value) {
    setLandlordId(value);
    setPropertyId(properties.find((item) => item.landlordId === value)?.id || "");
  }
  async function submit(event) {
    event.preventDefault(); setPending(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (!data.unitId) delete data.unitId;
    const response = await fetch("/api/tenants", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { setError(payload.error || payload.message || "Unable to add tenant"); setPending(false); return; }
    router.refresh(); onClose();
  }

  const fields = "h-10 w-full rounded border border-default bg-surface px-3";
  return <div className="fixed inset-0 z-60 grid place-items-center bg-primary/45 p-4" onClick={onClose}><section className="w-full max-w-lg rounded-md bg-surface p-6 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex justify-between"><div><p className="section-kicker">People</p><h2 className="mt-1">Add tenant</h2></div><Button variant="icon" onClick={onClose}><X size={16} /></Button></div><form className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1" onSubmit={submit}><label><span className="mb-1.5 block font-semibold">First name</span><input className={fields} name="firstName" required /></label><label><span className="mb-1.5 block font-semibold">Last name</span><input className={fields} name="lastName" required /></label><label className="col-span-full max-sm:col-span-1"><span className="mb-1.5 block font-semibold">Email</span><input className={fields} name="email" type="email" required /></label><label><span className="mb-1.5 block font-semibold">Phone</span><input className={fields} name="phone" /></label><label><span className="mb-1.5 block font-semibold">Landlord</span><select className={fields} name="landlordId" value={landlordId} onChange={(event) => changeLandlord(event.target.value)} required>{landlords.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span className="mb-1.5 block font-semibold">Property</span><select className={fields} name="propertyId" value={propertyId} onChange={(event) => setPropertyId(event.target.value)} required>{availableProperties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label><span className="mb-1.5 block font-semibold">Unit</span><select className={fields} name="unitId" defaultValue=""><option value="">Unassigned</option>{units.filter((item) => item.propertyId === propertyId).map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</select></label>{error ? <p className="col-span-full rounded bg-danger-subtle p-3 text-danger">{error}</p> : null}<p className="col-span-full text-sm text-secondary">The tenant is added immediately and receives a 48-hour email verification link.</p><div className="col-span-full flex justify-end gap-2"><Button variant="secondary" type="button" onClick={onClose}>Cancel</Button><Button disabled={pending || !propertyId}>{pending ? "Adding..." : "Add tenant"}</Button></div></form></section></div>;
}
