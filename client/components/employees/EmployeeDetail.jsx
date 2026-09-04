"use client";

import { Building2, Mail, Phone, X } from "lucide-react";
import Button from "@/components/ui/Button";

const detailRowClass = "flex justify-between gap-4 border-b border-default py-3";
const detailTermClass = "text-secondary";
const detailValueClass = "m-0 text-right font-semibold";
const contactClass = "flex min-w-0 items-center gap-2 rounded border border-default p-2.5";
const contactTextClass = "flex min-w-0 flex-col";

export default function EmployeeDetail({ employee, properties, onClose }) {
  if (!employee) return null;
  const assignedIds = new Set(employee.propertyIds || []);
  const assignedProperties = properties.filter((property) => assignedIds.has(property.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-canvas/60" onClick={onClose}>
      <aside
        className="relative h-full w-[min(430px,100%)] overflow-y-auto bg-surface p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded border-0 bg-surface/80 text-primary"
          onClick={onClose}
          aria-label="Close team member details"
        >
          <X size={19} />
        </button>

        <p className="font-bold uppercase tracking-wider text-accent">Team member</p>
        <div className="my-4 flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-full bg-secondary font-bold text-inverse">
            {employee.initials}
          </span>
          <div className="min-w-0">
            <h2 className="m-0 truncate">{employee.name}</h2>
            <p className="m-0 mt-1 text-muted">
              <span
                className={
                  employee.status === "Active"
                    ? "mr-1 rounded bg-success-subtle px-2 py-1 font-bold text-success"
                    : "mr-1 rounded bg-warning-subtle px-2 py-1 font-bold text-warning"
                }
              >
                {employee.status}
              </span>{" "}
              {employee.role}
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-[1fr_1.25fr] gap-2 max-sm:grid-cols-1">
          <div className={contactClass}>
            <Phone size={15} />
            <span className={contactTextClass}>
              <small>Phone</small>
              <b className="truncate">{employee.phone}</b>
            </span>
          </div>
          <div className={contactClass}>
            <Mail size={15} />
            <span className={contactTextClass}>
              <small>Email</small>
              <b className="truncate">{employee.email}</b>
            </span>
          </div>
        </div>

        <h3>Employment</h3>
        <dl className="m-0 border-t border-default">
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Role</dt>
            <dd className={detailValueClass}>{employee.role}</dd>
          </div>
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Department</dt>
            <dd className={detailValueClass}>{employee.department}</dd>
          </div>
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Job title</dt>
            <dd className={detailValueClass}>{employee.jobTitle || "—"}</dd>
          </div>
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Joined</dt>
            <dd className={detailValueClass}>{employee.createdAt}</dd>
          </div>
          <div className={detailRowClass}>
            <dt className={detailTermClass}>Email verified</dt>
            <dd className={detailValueClass}>{employee.emailVerified ? "Yes" : "Not yet"}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className={detailTermClass}>Last active</dt>
            <dd className={detailValueClass}>{employee.lastActive}</dd>
          </div>
        </dl>

        <h3 className="mt-5">Assigned properties</h3>
        <div className="mt-2 border-t border-default">
          {assignedProperties.length ? (
            assignedProperties.map((property) => (
              <div
                className="flex items-center gap-2 border-b border-default py-2.5"
                key={property.id}
              >
                <Building2 size={16} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <b className="text-primary">{property.name}</b>
                  <small className="text-muted">
                    {property.landlord} · {property.units} units
                  </small>
                </span>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-muted">
              No specific properties assigned — this member sees the full portfolio.
            </p>
          )}
        </div>

        <p className="mt-5 rounded border border-default bg-sidebar p-3 text-secondary">
          Permissions follow the <b>{employee.role}</b> role. Granular permission editing is managed
          by your administrator.
        </p>
      </aside>
    </div>
  );
}
