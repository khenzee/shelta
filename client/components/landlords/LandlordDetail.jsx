"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Building2, ChevronRight, Mail, Pencil, Phone, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
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
const metricClass = "flex flex-col gap-1 border-r border-default p-3";
const metricLabelClass = "text-muted";

function formatDate(value) {
  if (!value) return "Not yet";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function LandlordDetail({ landlord, properties, onClose, initialAction = null }) {
  const router = useRouter();
  const { openLandlord } = useWorkspace();
  const session = useSession();
  const canManage = ["ADMIN", "MANAGER"].includes(session?.role);
  const [editing, setEditing] = useState(initialAction === "edit");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmingArchive, setConfirmingArchive] = useState(false);

  if (!landlord) return null;
  const ownedProperties = properties.filter((property) => property.landlordId === landlord.id);
  const totalUnits = ownedProperties.reduce((sum, property) => {
    const count = Array.isArray(property.units)
      ? property.units.length
      : Number(property.units || 0);
    return sum + count;
  }, 0);
  const occupied = ownedProperties.reduce((sum, property) => {
    if (Array.isArray(property.units)) {
      return sum + property.units.filter((unit) => unit.status === "OCCUPIED").length;
    }
    return sum + Number(property.occupied || 0);
  }, 0);
  const monthlyRent = Number(landlord.monthlyRent || 0);
  const occupancyRate = totalUnits ? Math.round((occupied / totalUnits) * 100) : 0;

  async function updateLandlord(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch(`/api/landlords/${landlord.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || payload.error || "Unable to update landlord");
      setPending(false);
      return;
    }
    setEditing(false);
    setPending(false);
    router.refresh();
  }

  async function archiveLandlord() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/landlords/${landlord.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.message || payload.error || "Unable to archive landlord");
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
          aria-label="Close landlord details"
        >
          <X size={19} />
        </button>

        <p className="font-bold uppercase tracking-wider text-accent">Landlord / {landlord.code}</p>
        <div className="my-4 flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded bg-sidebar font-bold text-inverse">
            {landlord.initials}
          </span>
          <div className="min-w-0">
            <h2 className="m-0 truncate">{landlord.name}</h2>
            <p className="m-0 mt-1 text-muted">
              <span
                className={
                  landlord.portal === "Active"
                    ? "mr-1 rounded bg-success-subtle px-2 py-1 font-bold text-success"
                    : landlord.portal === "Invited"
                      ? "mr-1 rounded bg-info-subtle px-2 py-1 font-bold text-info"
                      : "mr-1 rounded bg-subtle px-2 py-1 font-bold text-muted"
                }
              >
                {landlord.portal} portal
              </span>{" "}
              {landlord.properties} properties under management
            </p>
          </div>
        </div>

        {editing ? (
          <form className="mb-5 space-y-3" onSubmit={updateLandlord}>
            <h3 className="mt-0">Edit landlord</h3>
            {[
              ["name", "Full name", landlord.name, "text"],
              ["email", "Email", landlord.email, "email"],
              ["phone", "Phone", landlord.phone || "", "tel"],
              ["address", "Address", landlord.address || "", "text"],
            ].map(([name, label, value, type]) => (
              <label className="block" key={name}>
                <span className="mb-1 block font-semibold text-secondary">{label}</span>
                <input
                  className="h-10 w-full rounded border border-default bg-surface px-3"
                  name={name}
                  type={type}
                  defaultValue={value}
                  required={name === "name" || name === "email"}
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
                <b className="truncate">{landlord.phone || "Not provided"}</b>
              </span>
            </div>
            <div className={contactClass}>
              <Mail size={15} />
              <span className={contactTextClass}>
                <small>Email</small>
                <b className="truncate">{landlord.email}</b>
              </span>
            </div>
          </div>
        )}

        <div className="my-5 grid grid-cols-3 rounded border border-default">
          <div className={metricClass}>
            <span className={metricLabelClass}>Properties</span>
            <strong>{landlord.properties}</strong>
          </div>
          <div className={metricClass}>
            <span className={metricLabelClass}>Units</span>
            <strong>{totalUnits}</strong>
          </div>
          <div className="flex flex-col gap-1 p-3">
            <span className={metricLabelClass}>Occupied</span>
            <strong>{occupied}</strong>
          </div>
        </div>

        <h3>Portfolio position</h3>
        <dl className="m-0 border-t border-default">
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Occupancy</dt>
            <dd className={detailValueClass}>{occupancyRate}%</dd>
          </div>
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Expected monthly rent</dt>
            <dd className={detailValueClass}>{money.format(monthlyRent)}</dd>
          </div>
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Items requiring attention</dt>
            <dd className={detailValueClass}>
              <span className={Number(landlord.attention || 0) > 0 ? "text-danger" : ""}>
                {landlord.attention}
              </span>
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className={detailTermClass}>Email verified</dt>
            <dd className={detailValueClass}>{formatDate(landlord.emailVerifiedAt)}</dd>
          </div>
        </dl>

        <h3 className="mt-5">Managed properties</h3>
        <div className="mt-1 border-t border-default">
          {ownedProperties.length ? (
            ownedProperties.map((property) => (
              <div
                className="flex items-center gap-2 border-b border-default py-2.5"
                key={property.id}
              >
                <Building2 size={16} />
                <span className="flex flex-1 flex-col">
                  <b className="text-primary">{property.name}</b>
                  <small className="text-muted">
                    {property.units} units · {property.status}
                  </small>
                </span>
                <ChevronRight size={15} />
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-muted">
              No properties yet. Add one from the properties page.
            </p>
          )}
        </div>

        <Button
          className="mt-5 w-full"
          onClick={() => {
            openLandlord(landlord.id);
            onClose();
          }}
        >
          Open landlord workspace <ChevronRight size={16} />
        </Button>
        {canManage && !editing ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil size={15} /> Edit
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
            <h3>Archive {landlord.name}?</h3>
            <p className="text-secondary">
              This keeps stored records but removes the landlord from active lists. Landlords with
              active properties or leases cannot be archived.
            </p>
            {error ? <p className="rounded bg-danger-subtle p-3 text-danger">{error}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setConfirmingArchive(false)}>
                Cancel
              </Button>
              <Button disabled={pending} onClick={archiveLandlord}>
                {pending ? "Archiving..." : "Archive"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
