"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReceiptText, X } from "lucide-react";
import Button from "@/components/ui/Button";

const INCOME_CATEGORIES = ["Rent payment", "Security deposit", "Penalties", "Other income"];
const EXPENSE_CATEGORIES = [
  "Repairs",
  "Cleaning",
  "Utilities",
  "Taxes",
  "Staff expenses",
  "Contractor payment",
];
const METHODS = [
  { label: "Bank transfer", value: "BANK_TRANSFER" },
  { label: "Cash", value: "CASH" },
  { label: "Card", value: "CARD" },
  { label: "Cheque", value: "CHEQUE" },
  { label: "Other", value: "OTHER" },
];

export default function TransactionForm({ mode, landlords, properties, units, tenants, onClose }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [landlordId, setLandlordId] = useState(landlords[0]?.id || "");
  const landlordProperties = properties.filter((item) => item.landlordId === landlordId);
  const [propertyId, setPropertyId] = useState(landlordProperties[0]?.id || "");
  const propertyUnits = units.filter((item) => item.propertyId === propertyId);
  const propertyTenants = tenants.filter((item) => item.propertyId === propertyId);

  const title = mode === "INCOME" ? "Record payment" : "Record expense";
  const categories = mode === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const field = "h-10 w-full rounded border border-default bg-surface px-3";
  const fieldLabel = "mb-1.5 block font-semibold";

  function changeLandlord(value) {
    setLandlordId(value);
    const nextProperties = properties.filter((item) => item.landlordId === value);
    setPropertyId(nextProperties[0]?.id || "");
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    data.type = mode;
    if (!data.unitId) delete data.unitId;
    if (!data.tenantId) delete data.tenantId;
    if (!data.notes) delete data.notes;
    const response = await fetch("/api/finances", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || payload.error || "Unable to record transaction");
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
            <p className="section-kicker">Finances</p>
            <h2 className="mt-1">{title}</h2>
            <p className="m-0 mt-1 text-muted">
              Record a complete financial movement against a property.
            </p>
          </div>
          <Button variant="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <form className="mt-5 grid grid-cols-2 gap-4 max-sm:grid-cols-1" onSubmit={submit}>
          <label>
            <span className={fieldLabel}>Amount (₦)</span>
            <input
              className={field}
              name="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </label>
          <label>
            <span className={fieldLabel}>Date</span>
            <input
              className={field}
              name="transactionDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
          <label>
            <span className={fieldLabel}>Landlord</span>
            <select
              className={field}
              value={landlordId}
              onChange={(event) => changeLandlord(event.target.value)}
              required
            >
              {landlords.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={fieldLabel}>Property</span>
            <select
              className={field}
              name="propertyId"
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
              required
            >
              {landlordProperties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={fieldLabel}>Unit (optional)</span>
            <select className={field} name="unitId" defaultValue="">
              <option value="">No specific unit</option>
              {propertyUnits.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code}
                </option>
              ))}
            </select>
          </label>
          {mode === "INCOME" ? (
            <label>
              <span className={fieldLabel}>Tenant (optional)</span>
              <select className={field} name="tenantId" defaultValue="">
                <option value="">No specific tenant</option>
                {propertyTenants.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label>
              <span className={fieldLabel}>Category</span>
              <select className={field} name="category" required>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          )}
          {mode === "INCOME" ? (
            <label className="col-span-full max-sm:col-span-1">
              <span className={fieldLabel}>Category</span>
              <select className={field} name="category" required>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            <span className={fieldLabel}>Payment method</span>
            <select className={field} name="paymentMethod" defaultValue="BANK_TRANSFER">
              {METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={fieldLabel}>Reference (optional)</span>
            <input
              className={field}
              name="reference"
              placeholder="Transaction or invoice reference"
            />
          </label>
          <label className="col-span-full max-sm:col-span-1">
            <span className={fieldLabel}>Notes (optional)</span>
            <textarea
              className="rounded border border-default bg-surface p-3 outline-none"
              name="notes"
              rows={3}
              placeholder="Add internal notes"
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
              {pending ? "Saving..." : "Save transaction"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
