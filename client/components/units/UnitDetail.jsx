"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, DoorOpen, Pencil, Users, X } from "lucide-react";
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

const statusPillClass = (status) =>
  status === "Occupied" || status === "OCCUPIED"
    ? "rounded-full bg-success-subtle px-2 py-1 font-bold text-success"
    : status === "Vacant" || status === "VACANT"
      ? "rounded-full bg-warning-subtle px-2 py-1 font-bold text-warning"
      : status === "Reserved" || status === "RESERVED"
        ? "rounded-full bg-info-subtle px-2 py-1 font-bold text-info"
        : "rounded-full bg-danger-subtle px-2 py-1 font-bold text-danger";

const UNIT_STATUS_LABELS = {
  OCCUPIED: "Occupied",
  VACANT: "Vacant",
  RESERVED: "Reserved",
  UNDER_REPAIR: "Under Repair",
  ARCHIVED: "Archived",
};

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

export default function UnitDetail({ unit, onClose, initialAction = null }) {
  const router = useRouter();
  const session = useSession();
  const canManage = ["ADMIN", "MANAGER"].includes(session?.role);
  const [editing, setEditing] = useState(initialAction === "edit");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!unit) return undefined;
    let cancelled = false;
    fetch(`/api/units/${unit.id}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) setDetail(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [unit]);

  if (!unit) return null;
  const data = detail || unit;
  const property = data.property?.name || unit.property || "Unassigned";
  const propertyName = typeof property === "string" ? property : "Unassigned";
  const statusCode = UNIT_STATUS_LABELS[data.status] ? data.status : data.status;
  const statusLabel = UNIT_STATUS_LABELS[data.status] || data.status;
  const tenant =
    Array.isArray(data.tenants) && data.tenants.length
      ? data.tenants[0]
      : unit.tenant
        ? {
            firstName: unit.tenant.split(" ")[0],
            lastName: unit.tenant.split(" ").slice(1).join(" "),
            email: null,
            phone: null,
          }
        : null;
  const activeLease =
    Array.isArray(data.leases) && data.leases.length
      ? data.leases.find((lease) => ["ACTIVE", "EXPIRING"].includes(lease.status)) || data.leases[0]
      : null;
  const rent = Number(data.monthlyRent ?? unit.rent ?? 0);
  const deposit = Number(data.securityDeposit ?? unit.deposit ?? 0);

  async function updateUnit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    for (const key of ["bedrooms", "bathrooms", "monthlyRent", "securityDeposit"]) {
      payload[key] = Number(payload[key]);
    }
    if (!payload.floor) delete payload.floor;
    const response = await fetch(`/api/units/${unit.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.message || body.error || "Unable to update unit");
      setPending(false);
      return;
    }
    setEditing(false);
    setPending(false);
    const refreshed = await fetch(`/api/units/${unit.id}`, { cache: "no-store" });
    if (refreshed.ok) setDetail(await refreshed.json());
    router.refresh();
  }

  async function archiveUnit() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/units/${unit.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.message || body.error || "Unable to archive unit");
      setPending(false);
      return;
    }
    window.location.reload();
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
          aria-label="Close unit details"
        >
          <X size={19} />
        </button>

        <p className="font-bold uppercase tracking-wider text-accent">{propertyName}</p>
        <div className="my-3 flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded bg-sidebar font-bold text-inverse">
            {data.number || unit.code}
          </span>
          <div className="min-w-0">
            <h2 className="m-0">Unit {data.number || unit.code}</h2>
            <p className="m-0 text-muted">
              {data.type}
              {data.floor ? ` · Floor ${data.floor}` : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-y border-default py-3">
          <span className={statusPillClass(statusCode)}>{statusLabel}</span>
          <b className="text-primary">
            {money.format(rent)} <small className="text-muted">/ month</small>
          </b>
        </div>

        {editing ? (
          <form className="my-5 grid grid-cols-2 gap-3" onSubmit={updateUnit}>
            <h3 className="col-span-full mt-0">Edit unit</h3>
            {[
              ["number", "Unit number", data.number || unit.code, "text", "1"],
              ["floor", "Floor", data.floor || "", "text", "1"],
              ["type", "Type", data.type, "text", "1"],
              ["bedrooms", "Bedrooms", data.bedrooms ?? unit.bedrooms, "number", "1"],
              ["bathrooms", "Bathrooms", data.bathrooms ?? unit.bathrooms, "number", "0.5"],
              ["monthlyRent", "Monthly rent", rent, "number", "1"],
              ["securityDeposit", "Security deposit", deposit, "number", "1"],
            ].map(([name, label, value, type, step]) => (
              <label className={name === "type" ? "col-span-full" : "block"} key={name}>
                <span className="mb-1 block font-semibold text-secondary">{label}</span>
                <input
                  className="h-10 w-full rounded border border-default bg-surface px-3"
                  name={name}
                  type={type}
                  step={step}
                  min={type === "number" ? 0 : undefined}
                  defaultValue={value}
                  required={name !== "floor"}
                />
              </label>
            ))}
            {error ? (
              <p className="col-span-full rounded bg-danger-subtle p-3 text-danger">{error}</p>
            ) : null}
            <div className="col-span-full flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button disabled={pending}>{pending ? "Saving..." : "Save changes"}</Button>
            </div>
          </form>
        ) : (
          <>
            <div className="my-5 grid grid-cols-3 rounded border border-default">
              <div className="flex flex-col gap-1 border-r border-default p-3">
                <span className="text-muted">Bedrooms</span>
                <strong>{data.bedrooms ?? unit.bedrooms}</strong>
              </div>
              <div className="flex flex-col gap-1 border-r border-default p-3">
                <span className="text-muted">Bathrooms</span>
                <strong>{data.bathrooms ?? unit.bathrooms}</strong>
              </div>
              <div className="flex flex-col gap-1 p-3">
                <span className="text-muted">Deposit</span>
                <strong>{money.format(deposit)}</strong>
              </div>
            </div>

            <h3>Current tenancy</h3>
            {tenant ? (
              <div className="my-3 flex items-center gap-2.5 rounded border border-default bg-subtle p-3">
                <div className="grid size-9 place-items-center rounded-full bg-hover font-bold text-primary">
                  {[tenant.firstName, tenant.lastName]
                    .filter(Boolean)
                    .map((part) => part?.[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <strong className="block text-primary">
                    {[tenant.firstName, tenant.lastName].filter(Boolean).join(" ")}
                  </strong>
                  {activeLease ? (
                    <span className="text-muted">
                      Lease {formatDate(activeLease.startDate)} → {formatDate(activeLease.endDate)}
                    </span>
                  ) : (
                    <span className="text-muted">No active lease</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="my-3 flex items-center gap-2.5 rounded border border-default bg-subtle p-3">
                <Users size={20} />
                <div>
                  <strong>No active tenant</strong>
                  <span className="text-muted">This unit is available for assignment.</span>
                </div>
              </div>
            )}

            {activeLease ? (
              <>
                <h3 className="mt-5">Lease</h3>
                <dl className="m-0 border-t border-default">
                  <div className={detailRowClass}>
                    <dt className={detailTermClass}>Status</dt>
                    <dd className={detailValueClass}>
                      {LEASE_STATUS_LABELS[activeLease.status] || activeLease.status}
                    </dd>
                  </div>
                  <div className={detailRowClass}>
                    <dt className={detailTermClass}>Period</dt>
                    <dd className={detailValueClass}>
                      {formatDate(activeLease.startDate)} → {formatDate(activeLease.endDate)}
                    </dd>
                  </div>
                  <div className={detailRowClass}>
                    <dt className={detailTermClass}>Rent amount</dt>
                    <dd className={detailValueClass}>
                      {money.format(Number(activeLease.rentAmount || 0))} / month
                    </dd>
                  </div>
                  <div className={detailRowClass}>
                    <dt className={detailTermClass}>Payment schedule</dt>
                    <dd className={detailValueClass}>
                      {String(activeLease.paymentSchedule || "monthly")}
                    </dd>
                  </div>
                </dl>
              </>
            ) : null}

            <h3 className="mt-5">Financial details</h3>
            <dl className="m-0 border-t border-default">
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Monthly rent</dt>
                <dd className={detailValueClass}>{money.format(rent)}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Security deposit</dt>
                <dd className={detailValueClass}>{money.format(deposit)}</dd>
              </div>
            </dl>
          </>
        )}

        {!editing && canManage ? (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil size={15} /> Edit unit
            </Button>
            <Button
              variant="secondary"
              onClick={() => setConfirmingArchive(true)}
              className="text-danger"
            >
              <Archive size={15} /> Archive
            </Button>
          </div>
        ) : null}
      </aside>

      {confirmingArchive ? (
        <div
          className="fixed inset-0 z-60 grid place-items-center bg-primary/45 p-4"
          onClick={() => setConfirmingArchive(false)}
        >
          <section
            className="w-full max-w-sm rounded-md bg-surface p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Archive unit {data.number || unit.code}?</h3>
            <p className="text-secondary">
              This keeps stored records but marks the unit as archived. Units with active leases
              cannot be archived.
            </p>
            {error ? <p className="rounded bg-danger-subtle p-3 text-danger">{error}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setConfirmingArchive(false)}>
                Cancel
              </Button>
              <Button disabled={pending} onClick={archiveUnit}>
                {pending ? "Archiving..." : "Archive"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
