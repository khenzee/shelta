"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Building2, Mail, Pencil, Phone, X } from "lucide-react";
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
const contactClass = "flex min-w-0 items-center gap-2 rounded border border-default p-2.5";
const contactTextClass = "flex min-w-0 flex-col";

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

export default function TenantDetail({ tenant, onClose, initialAction = null }) {
  const router = useRouter();
  const session = useSession();
  const canManage = ["ADMIN", "MANAGER"].includes(session?.role);
  const [editing, setEditing] = useState(initialAction === "edit");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!tenant) return undefined;
    let cancelled = false;
    fetch(`/api/tenants/${tenant.id}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) setDetail(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [tenant]);

  if (!tenant) return null;
  const data = detail || tenant;
  const propertyName = data.property?.name || tenant.property || "Unassigned";
  const landlordName =
    typeof data.landlord === "string"
      ? data.landlord
      : data.landlord?.name || tenant.landlord || "—";
  const unitNumber = data.unit?.number || tenant.unit || "Unassigned";
  const activeLease =
    Array.isArray(data.leases) && data.leases.length
      ? data.leases.find((lease) => ["ACTIVE", "EXPIRING"].includes(lease.status)) || null
      : null;
  const phone = data.phone && data.phone !== "Not provided" ? data.phone : tenant.phone;
  const statusLabel = tenant.status;

  async function updateTenant(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch(`/api/tenants/${tenant.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || payload.error || "Unable to update tenant");
      setPending(false);
      return;
    }
    setEditing(false);
    setPending(false);
    const refreshed = await fetch(`/api/tenants/${tenant.id}`, { cache: "no-store" });
    if (refreshed.ok) setDetail(await refreshed.json());
    router.refresh();
  }

  async function archiveTenant() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/tenants/${tenant.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.message || payload.error || "Unable to archive tenant");
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
          aria-label="Close tenant details"
        >
          <X size={19} />
        </button>

        <p className="font-bold uppercase tracking-wider text-accent">Tenant profile</p>
        <div className="my-4 flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-full bg-primary font-bold text-inverse">
            {tenant.initials}
          </span>
          <div className="min-w-0">
            <h2 className="m-0">{data.name || tenant.name}</h2>
            <p className="m-0 mt-1 text-muted">
              <span
                className={
                  statusLabel === "Active"
                    ? "mr-1 rounded-full bg-success-subtle px-2 py-1 font-bold text-success"
                    : statusLabel === "Notice Given"
                      ? "mr-1 rounded-full bg-warning-subtle px-2 py-1 font-bold text-warning"
                      : "mr-1 rounded-full bg-subtle px-2 py-1 font-bold text-muted"
                }
              >
                {statusLabel}
              </span>{" "}
              Tenant since {formatDate(data.createdAt)}
            </p>
          </div>
        </div>

        {editing ? (
          <form className="mb-5 space-y-3" onSubmit={updateTenant}>
            <h3 className="mt-0">Edit tenant</h3>
            {[
              ["firstName", "First name", data.firstName ?? tenant.firstName, "text"],
              ["lastName", "Last name", data.lastName ?? tenant.lastName, "text"],
              ["email", "Email", data.email ?? tenant.email, "email"],
              ["phone", "Phone", phone === "Not provided" ? "" : phone, "tel"],
            ].map(([name, label, value, type]) => (
              <label className="block" key={name}>
                <span className="mb-1 block font-semibold text-secondary">{label}</span>
                <input
                  className="h-10 w-full rounded border border-default bg-surface px-3"
                  name={name}
                  type={type}
                  defaultValue={value}
                  required={name !== "phone"}
                />
              </label>
            ))}
            {error ? <p className="rounded bg-danger-subtle p-3 text-danger">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button disabled={pending}>{pending ? "Saving..." : "Save changes"}</Button>
            </div>
          </form>
        ) : (
          <div className="mb-5 grid grid-cols-[1fr_1.25fr] gap-2 max-sm:grid-cols-1">
            <div className={contactClass}>
              <Phone size={15} />
              <span className={contactTextClass}>
                <small>Phone</small>
                <b className="truncate">{phone}</b>
              </span>
            </div>
            <div className={contactClass}>
              <Mail size={15} />
              <span className={contactTextClass}>
                <small>Email</small>
                <b className="truncate">{data.email ?? tenant.email}</b>
              </span>
            </div>
          </div>
        )}

        <h3>Rental information</h3>
        <div className="mb-5 overflow-hidden rounded border border-default">
          <div className="flex items-center gap-2 bg-subtle p-3">
            <Building2 size={19} />
            <span className="flex flex-1 flex-col">
              <strong>{propertyName}</strong>
              <small>
                Unit {typeof unitNumber === "string" ? unitNumber : "—"} · {landlordName}
              </small>
            </span>
          </div>
          <dl className="m-0 px-3">
            <div className={detailRowClass}>
              <dt className={detailTermClass}>Lease status</dt>
              <dd className={detailValueClass}>
                {activeLease
                  ? LEASE_STATUS_LABELS[activeLease.status] || activeLease.status
                  : "No active lease"}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>Lease period</dt>
              <dd className={detailValueClass}>
                {activeLease
                  ? `${formatDate(activeLease.startDate)} → ${formatDate(activeLease.endDate)}`
                  : "—"}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>Monthly rent</dt>
              <dd className={detailValueClass}>
                {money.format(Number(activeLease?.rentAmount ?? tenant.rent ?? 0))}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt className={detailTermClass}>Security deposit</dt>
              <dd className={detailValueClass}>
                {activeLease ? money.format(Number(activeLease.securityDeposit || 0)) : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-3">
              <dt className={detailTermClass}>Payment schedule</dt>
              <dd className={detailValueClass}>
                {activeLease ? String(activeLease.paymentSchedule || "monthly") : "—"}
              </dd>
            </div>
          </dl>
        </div>

        <h3>Personal information</h3>
        <dl className="m-0 border-t border-default">
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Occupation</dt>
            <dd className={detailValueClass}>{data.occupation ?? tenant.occupation}</dd>
          </div>
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Employer</dt>
            <dd className={detailValueClass}>{data.employer ?? tenant.employer}</dd>
          </div>
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Guarantor</dt>
            <dd className={detailValueClass}>{data.guarantorName ?? tenant.guarantor}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className={detailTermClass}>Email verified</dt>
            <dd className={detailValueClass}>
              {data.emailVerifiedAt ? formatDate(data.emailVerifiedAt) : "Not yet"}
            </dd>
          </div>
        </dl>

        {!editing && canManage ? (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil size={15} /> Edit tenant
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
            <h3>Archive {tenant.name}?</h3>
            <p className="text-secondary">
              This keeps stored records but removes the tenant from active lists. Tenants with
              active leases cannot be archived.
            </p>
            {error ? <p className="rounded bg-danger-subtle p-3 text-danger">{error}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setConfirmingArchive(false)}>
                Cancel
              </Button>
              <Button disabled={pending} onClick={archiveTenant}>
                {pending ? "Archiving..." : "Archive"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
