"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Pencil, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSession } from "@/components/auth/SessionProvider";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const detailRowClass = "flex justify-between gap-4 border-b border-default py-3";
const detailTermClass = "text-secondary";
const detailValueClass = "m-0 text-right font-semibold";

const LEASE_STATUS_LABELS = {
  ACTIVE: "Active",
  EXPIRING: "Expiring",
  DRAFT: "Draft",
  TERMINATED: "Terminated",
  EXPIRED: "Expired",
  RENEWED: "Renewed",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function LeaseDetail({ lease, onClose, initialAction = null }) {
  const router = useRouter();
  const session = useSession();
  const canManage = ["ADMIN", "MANAGER"].includes(session?.role);
  const [editing, setEditing] = useState(initialAction === "edit");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!lease) return undefined;
    let cancelled = false;
    fetch(`/api/leases/${lease.id}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) setDetail(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lease]);

  if (!lease) return null;
  const data = detail || lease;
  const tenantName = data.tenant
    ? [data.tenant.firstName, data.tenant.lastName].filter(Boolean).join(" ")
    : lease.tenant;
  const propertyName = data.property?.name || lease.property || "—";
  const landlordName =
    typeof data.landlord === "string"
      ? data.landlord
      : data.landlord?.name || lease.landlord || "—";
  const unitNumber = data.unit?.number || lease.unit || "—";
  const statusCode = data.statusCode || data.status;
  const statusLabel = LEASE_STATUS_LABELS[statusCode] || lease.status;
  const rent = Number(data.rentAmount ?? lease.rent ?? 0);
  const deposit = Number(data.securityDeposit ?? lease.deposit ?? 0);

  async function updateLease(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch(`/api/leases/${lease.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || payload.error || "Unable to update lease");
      setPending(false);
      return;
    }
    setEditing(false);
    setPending(false);
    const refreshed = await fetch(`/api/leases/${lease.id}`, { cache: "no-store" });
    if (refreshed.ok) setDetail(await refreshed.json());
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-canvas/60" onClick={onClose}>
      <aside
        className="relative h-full w-[min(430px,100%)] overflow-y-auto bg-surface p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded border-0 bg-surface/80 text-primary"
          onClick={onClose}
          aria-label="Close lease details"
        >
          <X size={19} />
        </button>

        <p className="font-bold uppercase tracking-wider text-accent">Lease agreement</p>
        <div className="my-3 flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded bg-sidebar text-inverse">
            <FileText size={26} />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 truncate">{tenantName}</h2>
            <p className="m-0 mt-1 text-muted">
              {propertyName} · Unit {unitNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-y border-default py-3">
          <span
            className={
              statusLabel === "Active"
                ? "rounded-full bg-success-subtle px-2 py-1 font-bold text-success"
                : statusLabel === "Expiring"
                  ? "rounded-full bg-warning-subtle px-2 py-1 font-bold text-warning"
                  : "rounded-full bg-subtle px-2 py-1 font-bold text-muted"
            }
          >
            {statusLabel}
          </span>
          <b className="text-primary">
            {money.format(rent)} <small className="text-muted">/ month</small>
          </b>
        </div>

        {editing ? (
          <form className="my-5 space-y-3" onSubmit={updateLease}>
            <h3 className="mt-0">Edit lease</h3>
            <label className="block">
              <span className="mb-1 block font-semibold text-secondary">Start date</span>
              <input
                className="h-10 w-full rounded border border-default bg-surface px-3"
                name="startDate"
                type="date"
                defaultValue={toDateInput(data.startDate || lease.start)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-semibold text-secondary">End date</span>
              <input
                className="h-10 w-full rounded border border-default bg-surface px-3"
                name="endDate"
                type="date"
                defaultValue={toDateInput(data.endDate || lease.end)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block font-semibold text-secondary">Payment schedule</span>
              <select
                className="h-10 w-full rounded border border-default bg-surface px-3"
                name="paymentSchedule"
                defaultValue={data.paymentSchedule || lease.schedule || "monthly"}
              >
                {["monthly", "quarterly", "yearly"].map((schedule) => (
                  <option key={schedule} value={schedule}>
                    {schedule}
                  </option>
                ))}
              </select>
            </label>
            {error ? <p className="rounded bg-danger-subtle p-3 text-danger">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button disabled={pending}>{pending ? "Saving..." : "Save changes"}</Button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="mt-5">Lease terms</h3>
            <dl className="m-0 border-t border-default">
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Lease period</dt>
                <dd className={detailValueClass}>
                  {formatDate(data.startDate || lease.start)} →{" "}
                  {formatDate(data.endDate || lease.end)}
                </dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Monthly rent</dt>
                <dd className={detailValueClass}>{money.format(rent)}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Security deposit</dt>
                <dd className={detailValueClass}>{money.format(deposit)}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Payment schedule</dt>
                <dd className={detailValueClass}>
                  {String(data.paymentSchedule || lease.schedule || "monthly")}
                </dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Landlord</dt>
                <dd className={detailValueClass}>{landlordName}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Signed agreement</dt>
                <dd className={detailValueClass}>
                  {data.signedDocumentId || lease.signed ? "On file" : "Awaiting signature"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className={detailTermClass}>Created</dt>
                <dd className={detailValueClass}>{formatDate(data.createdAt)}</dd>
              </div>
            </dl>
          </>
        )}

        {!editing && canManage ? (
          <Button variant="secondary" className="mt-5 w-full" onClick={() => setEditing(true)}>
            <Pencil size={15} /> Edit lease
          </Button>
        ) : null}
      </aside>
    </div>
  );
}
