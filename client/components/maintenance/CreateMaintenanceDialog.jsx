"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CreateMaintenanceDialog({ properties, units, tenants, onClose }) {
  const router = useRouter();
  const [propertyId, setPropertyId] = useState(properties[0]?.id || "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const availableUnits = units.filter((unit) => unit.propertyId === propertyId);
  const availableTenants = tenants.filter((tenant) => tenant.propertyId === propertyId);
  async function submit(event) {
    event.preventDefault(); setPending(true); setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (!data.unitId) delete data.unitId;
    if (!data.tenantId) delete data.tenantId;
    const response = await fetch("/api/maintenance", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { setError(payload.message || payload.error || "Unable to create request"); setPending(false); return; }
    router.refresh(); onClose();
  }
  const field = "h-10 w-full rounded border border-default bg-surface px-3";
  return <div className="fixed inset-0 z-[70] grid place-items-center bg-primary/45 p-4" onClick={onClose}><section className="w-full max-w-lg rounded-md bg-surface p-6 shadow-xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><p className="section-kicker">Operations</p><h2 className="mt-1">New maintenance request</h2></div><Button variant="icon" onClick={onClose}><X size={16} /></Button></div><form className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1" onSubmit={submit}><label className="col-span-full max-sm:col-span-1"><span className="mb-1 block font-semibold text-secondary">Property</span><select className={field} name="propertyId" value={propertyId} onChange={(event) => setPropertyId(event.target.value)} required>{properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select></label><label><span className="mb-1 block font-semibold text-secondary">Unit</span><select className={field} name="unitId"><option value="">No unit</option>{availableUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.code}</option>)}</select></label><label><span className="mb-1 block font-semibold text-secondary">Tenant</span><select className={field} name="tenantId"><option value="">Agency operations</option>{availableTenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}</select></label><label className="col-span-full max-sm:col-span-1"><span className="mb-1 block font-semibold text-secondary">Title</span><input className={field} name="title" required /></label><label><span className="mb-1 block font-semibold text-secondary">Category</span><select className={field} name="category"><option value="PLUMBING">Plumbing</option><option value="ELECTRICAL">Electrical</option><option value="HVAC">HVAC</option><option value="STRUCTURAL">Structural</option><option value="APPLIANCE">Appliance</option><option value="CLEANING">Cleaning</option><option value="SECURITY">Security</option><option value="OTHER">Other</option></select></label><label><span className="mb-1 block font-semibold text-secondary">Priority</span><select className={field} name="priority"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></label><label className="col-span-full max-sm:col-span-1"><span className="mb-1 block font-semibold text-secondary">Description</span><textarea className="min-h-24 w-full rounded border border-default bg-surface p-3" name="description" required /></label>{error ? <p className="col-span-full rounded bg-danger-subtle p-3 text-danger">{error}</p> : null}<div className="col-span-full flex justify-end gap-2"><Button variant="secondary" type="button" onClick={onClose}>Cancel</Button><Button disabled={pending || !properties.length}>{pending ? "Creating..." : "Create request"}</Button></div></form></section></div>;
}
