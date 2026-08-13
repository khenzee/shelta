"use client";
import { Building2, ChevronRight, Mail, Phone, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";

const detailRowClass = "flex justify-between border-b border-default py-3";
const detailValueClass = "m-0";
const contactClass = "flex items-center gap-2 rounded border border-default p-2.5";
const contactTextClass = "flex flex-col";
const metricClass = "flex flex-col border-r border-default p-3";
const metricLabelClass = "text-muted";

export default function LandlordDetail({ landlord, properties, onClose }) {
  const { openLandlord } = useWorkspace();
  if (!landlord) return null;
  const ownedProperties = properties.filter((property) => property.landlord === landlord.name);
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-canvas/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="relative h-full w-[min(430px,100%)] overflow-y-auto bg-surface p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          variant="icon"
          className="absolute right-4 top-4 bg-subtle text-primary"
          onClick={onClose}
          aria-label="Close landlord details"
        >
          <X size={18} />
        </Button>
        <p className="mt-2 font-bold uppercase tracking-wider text-accent">
          Landlord / {landlord.id}
        </p>
        <div className="my-4 flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded bg-sidebar font-bold text-inverse">
            {landlord.initials}
          </span>
          <div>
            <h2>{landlord.name}</h2>
            <p className="text-muted">
              <span className="mr-1 rounded bg-success-subtle px-2 py-1 text-success">
                {landlord.portal} portal
              </span>{" "}
              {landlord.properties} properties under management
            </p>
          </div>
        </div>
        <div className="mb-5 grid grid-cols-[1fr_1.25fr] gap-2 max-sm:grid-cols-1">
          <div className={contactClass}>
            <Phone size={15} />
            <span className={contactTextClass}>
              <small>Phone</small>
              <b>{landlord.phone}</b>
            </span>
          </div>
          <div className={contactClass}>
            <Mail size={15} />
            <span className={contactTextClass}>
              <small>Email</small>
              <b>{landlord.email}</b>
            </span>
          </div>
        </div>
        <div className="my-5 grid grid-cols-3 rounded border border-default">
          <div className={metricClass}>
            <span className={metricLabelClass}>Properties</span>
            <strong>{landlord.properties}</strong>
          </div>
          <div className={metricClass}>
            <span className={metricLabelClass}>Units</span>
            <strong>{landlord.units}</strong>
          </div>
          <div className="flex flex-col p-3">
            <span className={metricLabelClass}>Occupied</span>
            <strong>{landlord.occupied}</strong>
          </div>
        </div>
        <h3>Financial position</h3>
        <dl>
          <div className={detailRowClass}>
            <dt>Expected monthly rent</dt>
            <dd className={detailValueClass}>${landlord.monthlyRent.toLocaleString()}</dd>
          </div>
          <div className={detailRowClass}>
            <dt>Outstanding</dt>
            <dd
              className={`${detailValueClass} ${landlord.outstanding ? "text-danger" : "text-primary"}`}
            >
              ${landlord.outstanding.toLocaleString()}
            </dd>
          </div>
          <div className={detailRowClass}>
            <dt>Occupancy</dt>
            <dd className={detailValueClass}>
              {Math.round((landlord.occupied / landlord.units) * 100)}%
            </dd>
          </div>
          <div className={detailRowClass}>
            <dt>Items requiring attention</dt>
            <dd className={detailValueClass}>{landlord.attention}</dd>
          </div>
        </dl>
        <h3 className="mt-5">Managed properties</h3>
        <div className="flex flex-col gap-2">
          {ownedProperties.length ? (
            ownedProperties.map((property) => (
              <div
                className="flex items-center gap-2 rounded border border-default p-3"
                key={property.id}
              >
                <Building2 size={16} />
                <span className="flex flex-1 flex-col">
                  <b>{property.name}</b>
                  <small className="text-muted">
                    {property.units} units · {property.status}
                  </small>
                </span>
                <ChevronRight size={15} />
              </div>
            ))
          ) : (
            <p className="text-muted">Additional portfolio records will appear here.</p>
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
      </aside>
    </div>
  );
}
