"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

const TYPES = ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4 Bedroom", "Office", "Shop"];

export default function CreateUnitDialog({ properties, onClose }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const field = "h-10 w-full rounded border border-default bg-surface px-3";
  const fieldLabel = "mb-1.5 block font-semibold";

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    for (const key of ["bedrooms", "bathrooms", "monthlyRent", "securityDeposit"]) {
      data[key] = Number(data[key]);
    }
    if (!data.floor) delete data.floor;
    const response = await fetch("/api/units", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || payload.message || "Unable to add unit");
      setPending(false);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-primary/45 p-4" onClick={onClose}>
      <section
        className="w-full max-w-lg rounded-md bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between">
          <div>
            <p className="section-kicker">Inventory</p>
            <h2 className="mt-1">Add unit</h2>
          </div>
          <Button variant="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <form className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1" onSubmit={submit}>
          <label className="col-span-full max-sm:col-span-1">
            <span className={fieldLabel}>Property</span>
            <select className={field} name="propertyId" required>
              {properties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={fieldLabel}>Unit number</span>
            <input className={field} name="number" placeholder="e.g. 2A" required />
          </label>
          <label>
            <span className={fieldLabel}>Floor (optional)</span>
            <input className={field} name="floor" placeholder="e.g. 2" />
          </label>
          <label className="col-span-full max-sm:col-span-1">
            <span className={fieldLabel}>Type</span>
            <select className={field} name="type" required>
              {TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={fieldLabel}>Bedrooms</span>
            <input
              className={field}
              name="bedrooms"
              type="number"
              min="0"
              defaultValue="0"
              required
            />
          </label>
          <label>
            <span className={fieldLabel}>Bathrooms</span>
            <input
              className={field}
              name="bathrooms"
              type="number"
              min="0"
              step="0.5"
              defaultValue="1"
              required
            />
          </label>
          <label>
            <span className={fieldLabel}>Monthly rent (₦)</span>
            <input
              className={field}
              name="monthlyRent"
              type="number"
              min="0"
              placeholder="650000"
              required
            />
          </label>
          <label>
            <span className={fieldLabel}>Security deposit (₦)</span>
            <input
              className={field}
              name="securityDeposit"
              type="number"
              min="0"
              placeholder="1300000"
              required
            />
          </label>
          {error ? (
            <p className="col-span-full rounded bg-danger-subtle p-3 text-danger">{error}</p>
          ) : null}
          <div className="col-span-full flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={pending || properties.length === 0}>
              {pending ? "Adding..." : "Add unit"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
