"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CreateLandlordDialog({ onClose }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const field = "h-10 w-full rounded border border-default bg-surface px-3";
  const fieldLabel = "mb-1.5 block font-semibold";

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/landlords", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.error || payload.message || "Unable to add landlord");
      setPending(false);
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-primary/45 p-4" onClick={onClose}>
      <section
        className="w-full max-w-md rounded-md bg-surface p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between">
          <div>
            <p className="section-kicker">Portfolio</p>
            <h2 className="mt-1">Add landlord</h2>
          </div>
          <Button variant="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <form className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1" onSubmit={submit}>
          <label className="col-span-full max-sm:col-span-1">
            <span className={fieldLabel}>Full name</span>
            <input className={field} name="name" placeholder="e.g. Folake Adeyemi" required />
          </label>
          <label className="col-span-full max-sm:col-span-1">
            <span className={fieldLabel}>Email address</span>
            <input
              className={field}
              name="email"
              type="email"
              placeholder="landlord@example.com"
              required
            />
          </label>
          <label>
            <span className={fieldLabel}>Phone (optional)</span>
            <input className={field} name="phone" type="tel" placeholder="+234..." />
          </label>
          <label>
            <span className={fieldLabel}>Address (optional)</span>
            <input className={field} name="address" placeholder="Street, city" />
          </label>
          {error ? (
            <p className="col-span-full rounded bg-danger-subtle p-3 text-danger">{error}</p>
          ) : null}
          <p className="col-span-full text-secondary">
            The landlord is added immediately and receives a 48-hour email verification link.
          </p>
          <div className="col-span-full flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={pending}>{pending ? "Adding..." : "Add landlord"}</Button>
          </div>
        </form>
      </section>
    </div>
  );
}
