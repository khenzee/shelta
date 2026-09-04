"use client";

import { useEffect, useState } from "react";
import { Archive, Building2, MapPin, Pencil, Plus, X } from "lucide-react";
import { useSession } from "@/components/auth/SessionProvider";
import Button from "@/components/ui/Button";
import CreateUnitDialog from "@/components/units/CreateUnitDialog";

const metricClass = "flex flex-col gap-1 border-r border-default p-3";
const metricLabelClass = "text-muted";
const detailRowClass = "flex justify-between gap-4 border-b border-default py-3";
const detailTermClass = "text-secondary";
const detailValueClass = "m-0 text-right font-semibold";

const STATUS_OPTIONS = [
  { code: "ACTIVE", label: "Active" },
  { code: "VACANT", label: "Vacant" },
  { code: "UNDER_MAINTENANCE", label: "Under Maintenance" },
  { code: "SOLD", label: "Sold" },
  { code: "ARCHIVED", label: "Archived" },
];

const STATUS_CODE_BY_LABEL = {
  Active: "ACTIVE",
  Vacant: "VACANT",
  "Under Maintenance": "UNDER_MAINTENANCE",
  Sold: "SOLD",
  Archived: "ARCHIVED",
};

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const statusBadgeClass = (status) =>
  status === "Active"
    ? "rounded bg-success-subtle px-2 py-1 font-bold text-success"
    : status === "Vacant"
      ? "rounded bg-warning-subtle px-2 py-1 font-bold text-warning"
      : status === "Under Maintenance"
        ? "rounded bg-info-subtle px-2 py-1 font-bold text-info"
        : "rounded bg-subtle px-2 py-1 font-bold text-muted";

const UNIT_STATUS_LABELS = {
  OCCUPIED: "Occupied",
  VACANT: "Vacant",
  RESERVED: "Reserved",
  UNDER_REPAIR: "Under Repair",
  ARCHIVED: "Archived",
};

const unitBadgeClass = (status) =>
  status === "OCCUPIED"
    ? "rounded bg-success-subtle px-2 py-1 font-bold text-success"
    : status === "VACANT"
      ? "rounded bg-warning-subtle px-2 py-1 font-bold text-warning"
      : status === "RESERVED"
        ? "rounded bg-info-subtle px-2 py-1 font-bold text-info"
        : "rounded bg-danger-subtle px-2 py-1 font-bold text-danger";

export default function PropertyDetail({
  property,
  onClose,
  initialAction = null,
  landlords = [],
}) {
  const session = useSession();
  const canManage = ["ADMIN", "MANAGER"].includes(session?.role);
  const [editing, setEditing] = useState(initialAction === "edit");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmingArchive, setConfirmingArchive] = useState(false);
  const [addingUnit, setAddingUnit] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!property) return undefined;
    let cancelled = false;
    fetch(`/api/properties/${property.id}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) setDetail(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [property]);

  if (!property) return null;
  const data = detail || property;
  const accent = data.accent || property.accent || "forest";
  const unitsArray = Array.isArray(data.units) ? data.units : [];
  const unitsCount = Array.isArray(data.units) ? data.units.length : Number(data.units || 0);
  const occupied = Array.isArray(data.units)
    ? unitsArray.filter((unit) => unit.status === "OCCUPIED").length
    : Number(data.occupied || 0);
  const rent = Array.isArray(data.units)
    ? unitsArray.reduce((sum, unit) => sum + Number(unit.monthlyRent || 0), 0)
    : Number(data.rent || 0);
  const vacant = unitsCount - occupied;
  const tenantCount = data._count?.tenants;
  const leaseCount = data._count?.leases;
  const landlordName =
    typeof data.landlord === "string"
      ? data.landlord
      : data.landlord?.name || data.landlordId || "—";

  async function updateProperty(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch(`/api/properties/${property.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(payload.message || payload.error || "Unable to update property");
      setPending(false);
      return;
    }
    setDetail(null);
    setEditing(false);
    setPending(false);
    const refreshed = await fetch(`/api/properties/${property.id}`, { cache: "no-store" });
    if (refreshed.ok) setDetail(await refreshed.json());
  }

  async function archiveProperty() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.message || payload.error || "Unable to archive property");
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
          aria-label="Close property details"
        >
          <X size={19} />
        </button>
        <div
          className={
            accent === "forest"
              ? "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-primary text-inverse"
              : accent === "gold"
                ? "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-warning text-inverse"
                : accent === "brick"
                  ? "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-danger text-inverse"
                  : accent === "blue"
                    ? "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-info text-inverse"
                    : accent === "olive"
                      ? "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-secondary text-inverse"
                      : "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-sidebar text-inverse"
          }
        >
          <Building2 size={38} />
        </div>
        <span className="font-bold tracking-wide text-secondary">{data.code}</span>
        <h2 className="my-1">{data.name}</h2>
        <p className="m-0 flex items-center gap-1 text-secondary">
          <MapPin size={14} />
          {data.address}
        </p>

        <div className="my-5 grid grid-cols-3 rounded border border-default">
          <div className={metricClass}>
            <span className={metricLabelClass}>Total units</span>
            <strong>{unitsCount}</strong>
          </div>
          <div className={metricClass}>
            <span className={metricLabelClass}>Occupied</span>
            <strong>{occupied}</strong>
          </div>
          <div className="flex flex-col gap-1 p-3">
            <span className={metricLabelClass}>Vacant</span>
            <strong>{vacant}</strong>
          </div>
        </div>

        {editing ? (
          <form className="mt-5 space-y-3" onSubmit={updateProperty}>
            <h3>Edit property</h3>
            {[
              ["name", "Property name", data.name],
              ["type", "Property type", data.type],
              ["address", "Address", data.address],
              ["city", "City", data.city || ""],
              ["state", "State", data.state || ""],
            ].map(([name, label, value]) => (
              <label className="block" key={name}>
                <span className="mb-1 block font-semibold text-secondary">{label}</span>
                <input
                  className="h-10 w-full rounded border border-default bg-surface px-3"
                  name={name}
                  defaultValue={value}
                  required={["name", "type", "address"].includes(name)}
                />
              </label>
            ))}
            <label className="block">
              <span className="mb-1 block font-semibold text-secondary">Landlord</span>
              <select
                className="h-10 w-full rounded border border-default bg-surface px-3"
                name="landlordId"
                defaultValue={data.landlordId || ""}
                required
              >
                {landlords.length ? (
                  landlords.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))
                ) : (
                  <option value={data.landlordId || ""}>{landlordName}</option>
                )}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block font-semibold text-secondary">Status</span>
              <select
                className="h-10 w-full rounded border border-default bg-surface px-3"
                name="status"
                defaultValue={STATUS_CODE_BY_LABEL[data.status] || data.status}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
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
            <h3>Property information</h3>
            <dl className="m-0 border-t border-default">
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Landlord</dt>
                <dd className={detailValueClass}>{landlordName}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Property type</dt>
                <dd className={detailValueClass}>{data.type}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Expected rent</dt>
                <dd className={detailValueClass}>{money.format(rent)} / month</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Tenants</dt>
                <dd className={detailValueClass}>{tenantCount ?? "—"}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Leases</dt>
                <dd className={detailValueClass}>{leaseCount ?? "—"}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Status</dt>
                <dd className={detailValueClass}>
                  <span className={statusBadgeClass(data.status)}>{data.status}</span>
                </dd>
              </div>
              {Array.isArray(data.amenities) && data.amenities.length ? (
                <div className={detailRowClass}>
                  <dt className={detailTermClass}>Amenities</dt>
                  <dd className={`${detailValueClass} max-w-[60%]`}>{data.amenities.join(", ")}</dd>
                </div>
              ) : null}
            </dl>

            <h3 className="mt-5">Units ({unitsCount})</h3>
            <div className="mt-1 border-t border-default">
              {unitsArray.length ? (
                unitsArray.map((unit) => (
                  <div
                    className="flex items-center justify-between gap-3 border-b border-default py-2.5"
                    key={unit.id}
                  >
                    <span className="flex min-w-0 flex-col">
                      <b>{unit.number}</b>
                      <small className="text-muted">
                        {unit.type} · {unit.bedrooms} bed · {unit.bathrooms} bath
                      </small>
                    </span>
                    <span className="flex flex-none flex-col items-end gap-1">
                      <span className={unitBadgeClass(unit.status)}>
                        {UNIT_STATUS_LABELS[unit.status] || unit.status}
                      </span>
                      <small className="text-muted">{money.format(unit.monthlyRent)}</small>
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-muted">No units recorded for this property.</p>
              )}
            </div>
          </>
        )}
        {!editing && canManage ? (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Pencil size={15} /> Edit property
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
        {!editing && canManage ? (
          <Button variant="secondary" className="mt-2 w-full" onClick={() => setAddingUnit(true)}>
            <Plus size={15} /> Add unit
          </Button>
        ) : null}
      </aside>

      {addingUnit ? (
        <CreateUnitDialog
          properties={[{ id: data.id, name: data.name }]}
          onClose={() => setAddingUnit(false)}
        />
      ) : null}

      {confirmingArchive ? (
        <div
          className="fixed inset-0 z-60 grid place-items-center bg-primary/45 p-4"
          onClick={() => setConfirmingArchive(false)}
        >
          <section
            className="w-full max-w-sm rounded-md bg-surface p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Archive {data.name}?</h3>
            <p className="text-secondary">
              This keeps stored records but removes the property from the active portfolio.
              Properties with active units or leases cannot be archived.
            </p>
            {error ? <p className="rounded bg-danger-subtle p-3 text-danger">{error}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" type="button" onClick={() => setConfirmingArchive(false)}>
                Cancel
              </Button>
              <Button disabled={pending} onClick={archiveProperty}>
                {pending ? "Archiving..." : "Archive"}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
