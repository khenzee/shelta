"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

const SCHEDULES = ["monthly", "quarterly", "yearly"];

export default function CreateLeaseDialog({ tenants, units, onClose }) {
  const router = useRouter();
  const assignableTenants = tenants.filter((tenant) => tenant.propertyId);
  const [tenantId, setTenantId] = useState(assignableTenants[0]?.id || "");
  const tenant = assignableTenants.find((item) => item.id === tenantId);
  const tenantUnits = tenant ? units.filter((unit) => unit.propertyId === tenant.propertyId) : [];
  const [unitId, setUnitId] = useState(tenant?.unitId || tenantUnits[0]?.id || "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const field = "h-10 w-full rounded border border-default bg-surface px-3";
  const fieldLabel = "mb-1.5 block font-semibold";

  function changeTenant(value) {
    setTenantId(value);
    const next = assignableTenants.find((item) => item.id === value);
    const nextUnits = next ? units.filter((unit) => unit.propertyId === next.propertyId) : [];
    setUnitId(next?.unitId || nextUnits[0]?.id || "");
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/leases", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || payload.error || "Unable to create lease");
      setPending(false);
      return;
    }
    router.refresh();
    onClose();
  }

  const today = new Date();
  const defaultStart = today.toISOString().slice(0, 10);
  const defaultEnd = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())
    .toISOString()
    .slice(0, 10);

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-primary/45 p-4" onClick={onClose}>
      <section
        className="w-full max-w-lg rounded-md bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between">
          <div>
            <p className="section-kicker">Operations</p>
            <h2 className="mt-1">Create lease</h2>
          </div>
          <Button variant="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <form className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1" onSubmit={submit}>
          <label className="col-span-full max-sm:col-span-1">
            <span className={fieldLabel}>Tenant</span>
            <select
              className={field}
              name="tenantId"
              value={tenantId}
              onChange={(event) => changeTenant(event.target.value)}
              required
            >
              {assignableTenants.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {item.property}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-full max-sm:col-span-1">
            <span className={fieldLabel}>Unit</span>
            <select
              className={field}
              name="unitId"
              value={unitId}
              onChange={(event) => setUnitId(event.target.value)}
              required
            >
              {tenantUnits.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} — {item.status}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={fieldLabel}>Start date</span>
            <input
              className={field}
              name="startDate"
              type="date"
              defaultValue={defaultStart}
              required
            />
          </label>
          <label>
            <span className={fieldLabel}>End date</span>
            <input
              className={field}
              name="endDate"
              type="date"
              defaultValue={defaultEnd}
              required
            />
          </label>
          <label className="col-span-full max-sm:col-span-1">
            <span className={fieldLabel}>Payment schedule</span>
            <select className={field} name="paymentSchedule" defaultValue="monthly" required>
              {SCHEDULES.map((schedule) => (
                <option key={schedule} value={schedule}>
                  {schedule}
                </option>
              ))}
            </select>
          </label>
          {error ? (
            <p className="col-span-full rounded bg-danger-subtle p-3 text-danger">{error}</p>
          ) : null}
          <p className="col-span-full text-secondary">
            Rent and deposit are copied from the selected unit. Units with an overlapping active
            lease cannot be used.
          </p>
          <div className="col-span-full flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={pending || !tenantId || !unitId}>
              {pending ? "Creating..." : "Create lease"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
