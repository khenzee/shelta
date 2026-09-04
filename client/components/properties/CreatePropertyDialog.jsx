"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

const TYPES = ["Apartment", "Duplex", "Terrace", "Bungalow", "Villa", "Commercial", "Mixed use"];

export default function CreatePropertyDialog({ landlords, onClose }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const field = "h-10 w-full rounded border border-default bg-surface px-3";
  const fieldLabel = "mb-1.5 block font-semibold";

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (!data.amenities) delete data.amenities;
    else
      data.amenities = String(data.amenities)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    for (const key of ["latitude", "longitude"]) {
      if (data[key] === "") delete data[key];
      else data[key] = Number(data[key]);
    }
    const response = await fetch("/api/properties", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || payload.message || "Unable to add property");
      setPending(false);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-primary/45 p-4" onClick={onClose}>
      <section
        className="w-full max-w-2xl rounded-md bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between">
          <div>
            <p className="section-kicker">Portfolio</p>
            <h2 className="mt-1">Add property</h2>
          </div>
          <Button variant="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <form className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1" onSubmit={submit}>
          <label className="col-span-full max-sm:col-span-1">
            <span className={fieldLabel}>Property name</span>
            <input className={field} name="name" placeholder="e.g. Greenview Towers" required />
          </label>
          <label>
            <span className={fieldLabel}>Type</span>
            <select className={field} name="type" required>
              {TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            <span className={fieldLabel}>Landlord</span>
            <select className={field} name="landlordId" required>
              {landlords.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label className="col-span-full max-sm:col-span-1">
            <span className={fieldLabel}>Address</span>
            <input className={field} name="address" placeholder="Street address" required />
          </label>
          <label>
            <span className={fieldLabel}>City</span>
            <input className={field} name="city" placeholder="e.g. Lekki" />
          </label>
          <label>
            <span className={fieldLabel}>State</span>
            <input className={field} name="state" placeholder="e.g. Lagos" />
          </label>
          <label>
            <span className={fieldLabel}>Latitude (optional)</span>
            <input
              className={field}
              name="latitude"
              type="number"
              step="any"
              placeholder="6.4281"
            />
          </label>
          <label>
            <span className={fieldLabel}>Longitude (optional)</span>
            <input
              className={field}
              name="longitude"
              type="number"
              step="any"
              placeholder="3.4219"
            />
          </label>
          <label className="col-span-full max-sm:col-span-1">
            <span className={fieldLabel}>Amenities (optional)</span>
            <input
              className={field}
              name="amenities"
              placeholder="Swimming pool, Gym, 24/7 security (comma separated)"
            />
          </label>
          {error ? (
            <p className="col-span-full rounded bg-danger-subtle p-3 text-danger">{error}</p>
          ) : null}
          <div className="col-span-full flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={pending || landlords.length === 0}>
              {pending ? "Adding..." : "Add property"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
