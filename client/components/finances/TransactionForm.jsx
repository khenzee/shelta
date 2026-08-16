"use client";

import { useState } from "react";
import { FileUp, ReceiptText, X } from "lucide-react";
import Button from "@/components/ui/Button";

const fieldLabelClass = "flex min-w-0 flex-col gap-1.5";
const fieldTitleClass = "font-semibold text-secondary";
const inputClass = "h-10 min-w-0 rounded border border-default bg-surface px-3 outline-none";

export default function TransactionForm({ mode, properties, tenants, onClose }) {
  const [saved, setSaved] = useState(false);
  const [property, setProperty] = useState(properties[0]?.name || "");
  const availableTenants = tenants.filter((tenant) => tenant.property === property);
  const title = mode === "Income" ? "Record payment" : "Record expense";

  return (
    <div
      className="fixed inset-0 z-60 flex justify-end bg-primary/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <aside
        className="relative h-full w-full max-w-107.5 overflow-y-auto bg-surface p-6 shadow-[-20px_0_50px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          variant="icon"
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded border-0 bg-subtle text-primary"
          onClick={onClose}
          aria-label="Close transaction form"
        >
          <X size={18} />
        </Button>
        <p className="section-kicker">Finances / {mode}</p>
        <div className="my-4.5 flex items-center gap-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded bg-subtle text-primary">
            <ReceiptText size={19} />
          </span>
          <div>
            <h2 className="m-0">{title}</h2>
            <p className="mt-1 text-secondary">
              Record a complete financial movement against a property.
            </p>
          </div>
        </div>
        {saved ? (
          <div className="my-8 flex flex-col items-center gap-3 rounded-md border border-default bg-sidebar p-6 text-center text-secondary">
            <ReceiptText size={22} />
            <strong className="text-primary">Transaction recorded</strong>
            <p>The ledger, rent reconciliation, and landlord statement will reflect this entry.</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={(event) => event.preventDefault()}>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <label className={fieldLabelClass}>
                <span className={fieldTitleClass}>Amount</span>
                <input className={inputClass} type="number" min="0" required placeholder="0.00" />
              </label>
              <label className={fieldLabelClass}>
                <span className={fieldTitleClass}>Date</span>
                <input className={inputClass} type="date" required />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <label className={fieldLabelClass}>
                <span className={fieldTitleClass}>Property</span>
                <select
                  className={inputClass}
                  value={property}
                  onChange={(event) => setProperty(event.target.value)}
                >
                  {properties.map((item) => (
                    <option key={item.id}>{item.name}</option>
                  ))}
                </select>
              </label>
              <label className={fieldLabelClass}>
                <span className={fieldTitleClass}>Unit</span>
                <input className={inputClass} required placeholder="Unit number" />
              </label>
            </div>
            {mode === "Income" ? (
              <label className={fieldLabelClass}>
                <span className={fieldTitleClass}>Tenant</span>
                <select className={inputClass} required defaultValue="">
                  <option value="" disabled>
                    Select tenant
                  </option>
                  {availableTenants.map((tenant) => (
                    <option key={tenant.id}>{tenant.name}</option>
                  ))}
                </select>
              </label>
            ) : null}
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <label className={fieldLabelClass}>
                <span className={fieldTitleClass}>Category</span>
                <select className={inputClass}>
                  {(mode === "Income"
                    ? ["Rent payment", "Security deposit", "Penalties", "Other income"]
                    : [
                        "Repairs",
                        "Cleaning",
                        "Utilities",
                        "Taxes",
                        "Staff expenses",
                        "Contractor payment",
                      ]
                  ).map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className={fieldLabelClass}>
                <span className={fieldTitleClass}>Payment method</span>
                <select className={inputClass}>
                  <option>Bank transfer</option>
                  <option>Card</option>
                  <option>Cash</option>
                  <option>Direct debit</option>
                </select>
              </label>
            </div>
            <label className={fieldLabelClass}>
              <span className={fieldTitleClass}>Reference</span>
              <input
                className={inputClass}
                required
                placeholder="Transaction or invoice reference"
              />
            </label>
            <label className={fieldLabelClass}>
              <span className={fieldTitleClass}>Notes</span>
              <textarea
                className="rounded border border-default bg-surface p-3 outline-none"
                rows={4}
                placeholder="Add internal notes"
              />
            </label>
            <Button variant="secondary" className="w-full" type="button" disabled title="Receipt upload is not available yet">
              <FileUp size={14} /> Upload receipt or invoice
            </Button>
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled title="Transaction creation is not connected yet">Save transaction</Button>
            </div>
          </form>
        )}
      </aside>
    </div>
  );
}
