"use client";

import { ChevronRight, Users, X } from "lucide-react";

export default function UnitDetail({ unit, onClose }) {
  if (!unit) return null;

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
          className="absolute right-4 top-4 grid size-8 place-items-center rounded bg-subtle text-primary"
          onClick={onClose}
          aria-label="Close unit details"
        >
          <X size={19} />
        </button>
        <p className="mt-2 font-bold uppercase tracking-wider text-accent">
          {unit.id} / {unit.property}
        </p>
        <div className="my-4 flex items-center gap-3">
          <span>{unit.number}</span>
          <div>
            <small>{unit.floor}</small>
            <h2>Unit {unit.number}</h2>
            <p>{unit.type}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-y border-default py-3">
          <span
            className={
              unit.status === "Occupied"
                ? "rounded-full bg-success-subtle px-2 py-1 font-bold text-success"
                : unit.status === "Vacant"
                  ? "rounded-full bg-warning-subtle px-2 py-1 font-bold text-warning"
                  : unit.status === "Reserved"
                    ? "rounded-full bg-info-subtle px-2 py-1 font-bold text-info"
                    : "rounded-full bg-danger-subtle px-2 py-1 font-bold text-danger"
            }
          >
            {unit.status}
          </span>
          <b>
            ${unit.rent.toLocaleString()} <small>/ month</small>
          </b>
        </div>

        <div className="my-5 grid grid-cols-3 rounded border border-default">
          <div>
            <strong>{unit.beds}</strong>
            <span>Bedrooms</span>
          </div>
          <div>
            <strong>{unit.baths}</strong>
            <span>Bathrooms</span>
          </div>
          <div>
            <strong>${unit.deposit.toLocaleString()}</strong>
            <span>Deposit</span>
          </div>
        </div>

        <h3>Current tenancy</h3>
        {unit.tenant ? (
          <div className="my-3 flex items-center gap-2.5 rounded border border-default bg-subtle p-3">
            <div className="grid size-8 place-items-center rounded-full bg-hover text-primary">
              {unit.tenant
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <strong>{unit.tenant}</strong>
              <span>{unit.lease}</span>
            </div>
            <ChevronRight size={17} />
          </div>
        ) : (
          <div className="my-3 flex items-center gap-2.5 rounded border border-default bg-subtle p-3">
            <Users size={20} />
            <div>
              <strong>No active tenant</strong>
              <span>This unit is available for assignment.</span>
            </div>
          </div>
        )}

        <h3>Financial details</h3>
        <dl>
          <div>
            <dt>Monthly rent</dt>
            <dd>${unit.rent.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Security deposit</dt>
            <dd>${unit.deposit.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Payment schedule</dt>
            <dd>Monthly</dd>
          </div>
          <div>
            <dt>Outstanding balance</dt>
            <dd>$0</dd>
          </div>
        </dl>

        <button
          className="mt-5 flex h-10 w-full items-center gap-2 rounded bg-primary px-3 text-inverse"
          onClick={onClose}
        >
          Open full unit record <ChevronRight className="ml-auto" size={16} />
        </button>
      </aside>
    </div>
  );
}
