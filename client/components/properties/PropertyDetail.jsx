"use client";

import { Building2, ChevronRight, MapPin, X } from "lucide-react";

const metricClass = "flex flex-col gap-1 border-r border-default p-3";
const metricLabelClass = "text-muted";
const detailRowClass = "flex justify-between gap-4 border-b border-default py-3";
const detailTermClass = "text-secondary";
const detailValueClass = "m-0 text-right font-semibold";

export default function PropertyDetail({ property, onClose }) {
  if (!property) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-canvas/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <aside
        className="relative h-full w-[min(430px,100%)] overflow-y-auto bg-surface p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded border-0 bg-subtle text-primary"
          onClick={onClose}
          aria-label="Close property details"
        >
          <X size={19} />
        </button>
        <div
          className={
            property.accent === "forest"
              ? "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-primary text-inverse"
              : property.accent === "gold"
                ? "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-warning text-inverse"
                : property.accent === "brick"
                  ? "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-danger text-inverse"
                  : property.accent === "blue"
                    ? "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-info text-inverse"
                    : property.accent === "olive"
                      ? "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-secondary text-inverse"
                      : "relative -mx-6 -mt-6 mb-5 grid h-36 place-items-center bg-sidebar text-inverse"
          }
        >
          <Building2 size={38} />
        </div>
        <span className="font-bold tracking-wide text-secondary">{property.id}</span>
        <h2 className="my-1">{property.name}</h2>
        <p className="m-0 flex items-center gap-1 text-secondary">
          <MapPin size={14} />
          {property.address}
        </p>

        <div className="my-5 grid grid-cols-3 rounded border border-default">
          <div className={metricClass}>
            <span className={metricLabelClass}>Total units</span>
            <strong>{property.units}</strong>
          </div>
          <div className={metricClass}>
            <span className={metricLabelClass}>Occupied</span>
            <strong>{property.occupied}</strong>
          </div>
          <div className="flex flex-col gap-1 p-3">
            <span className={metricLabelClass}>Vacant</span>
            <strong>{property.units - property.occupied}</strong>
          </div>
        </div>

        <h3>Property information</h3>
        <dl className="m-0 border-t border-default">
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Landlord</dt>
            <dd className={detailValueClass}>{property.landlord}</dd>
          </div>
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Property type</dt>
            <dd className={detailValueClass}>{property.type}</dd>
          </div>
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Expected rent</dt>
            <dd className={detailValueClass}>{property.rent} / month</dd>
          </div>
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Status</dt>
            <dd className={detailValueClass}>
              <span
                className={
                  property.status === "Active"
                    ? "rounded bg-success-subtle px-2 py-1 font-bold text-success"
                    : "rounded bg-warning-subtle px-2 py-1 font-bold text-warning"
                }
              >
                {property.status}
              </span>
            </dd>
          </div>
        </dl>

        <button
          className="mt-5 flex h-10 w-full items-center gap-2 rounded-md border border-primary bg-primary px-3 font-semibold text-inverse"
          onClick={onClose}
        >
          Open full property record <ChevronRight className="ml-auto" size={16} />
        </button>
      </aside>
    </div>
  );
}
