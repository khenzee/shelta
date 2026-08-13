"use client";
import { Building2, ChevronRight, Mail, Phone, X } from "lucide-react";
import Button from "@/components/ui/Button";

const detailRowClass = "flex justify-between border-b border-default py-3";
const detailValueClass = "m-0";
const contactClass = "flex min-w-0 items-center gap-2 rounded border border-default p-2.5";
const contactTextClass = "flex min-w-0 flex-col";
const tabClass = "border-0 bg-transparent p-2 text-secondary";

export default function TenantDetail({ tenant, onClose }) {
  if (!tenant) return null;
  const badge =
    tenant.payment === "Paid"
      ? "rounded-full bg-success-subtle px-2 py-1 font-bold text-success"
      : tenant.payment === "Partial"
        ? "rounded-full bg-warning-subtle px-2 py-1 font-bold text-warning"
        : "rounded-full bg-danger-subtle px-2 py-1 font-bold text-danger";
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
          aria-label="Close tenant details"
        >
          <X size={19} />
        </Button>
        <p className="mt-2 font-bold uppercase tracking-wider text-accent">
          Tenant profile / {tenant.id}
        </p>
        <div className="my-4 flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-full bg-primary font-bold text-inverse">
            {tenant.initials}
          </span>
          <div>
            <h2>{tenant.name}</h2>
            <p className="text-muted">
              <span
                className={
                  tenant.status === "Active"
                    ? "mr-1 rounded-full bg-success-subtle px-2 py-1 font-bold text-success"
                    : tenant.status === "Expiring"
                      ? "mr-1 rounded-full bg-warning-subtle px-2 py-1 font-bold text-warning"
                      : "mr-1 rounded-full bg-danger-subtle px-2 py-1 font-bold text-danger"
                }
              >
                {tenant.status}
              </span>{" "}
              Tenant since {tenant.leaseStart}
            </p>
          </div>
        </div>
        <div className="mb-5 grid grid-cols-[1fr_1.25fr] gap-2 max-sm:grid-cols-1">
          <div className={contactClass}>
            <Phone size={15} />
            <span className={contactTextClass}>
              <small>Phone</small>
              <b>{tenant.phone}</b>
            </span>
          </div>
          <div className={contactClass}>
            <Mail size={15} />
            <span className={contactTextClass}>
              <small>Email</small>
              <b>{tenant.email}</b>
            </span>
          </div>
        </div>
        <h3>Rental information</h3>
        <div className="mb-5 overflow-hidden rounded border border-default">
          <div className="flex items-center gap-2 bg-subtle p-3">
            <Building2 size={19} />
            <span className="flex flex-1 flex-col">
              <strong>{tenant.property}</strong>
              <small>Unit {tenant.unit}</small>
            </span>
            <ChevronRight size={17} />
          </div>
          <dl className="px-3">
            <div className={detailRowClass}>
              <dt>Lease period</dt>
              <dd className={detailValueClass}>
                {tenant.leaseStart} - {tenant.leaseEnd}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt>Monthly rent</dt>
              <dd className={detailValueClass}>${tenant.rent.toLocaleString()}</dd>
            </div>
            <div className={detailRowClass}>
              <dt>Outstanding</dt>
              <dd
                className={`${detailValueClass} ${tenant.balance ? "text-danger" : "text-primary"}`}
              >
                ${tenant.balance.toLocaleString()}
              </dd>
            </div>
            <div className={detailRowClass}>
              <dt>Payment status</dt>
              <dd className={detailValueClass}>
                <span className={badge}>{tenant.payment}</span>
              </dd>
            </div>
          </dl>
        </div>
        <h3>Personal information</h3>
        <dl>
          <div className={detailRowClass}>
            <dt>Occupation</dt>
            <dd className={detailValueClass}>{tenant.occupation}</dd>
          </div>
          <div className={detailRowClass}>
            <dt>Employer</dt>
            <dd className={detailValueClass}>{tenant.employer}</dd>
          </div>
          <div className={detailRowClass}>
            <dt>Guarantor</dt>
            <dd className={detailValueClass}>{tenant.guarantor}</dd>
          </div>
          <div className={detailRowClass}>
            <dt>Documents</dt>
            <dd className={detailValueClass}>4 verified files</dd>
          </div>
        </dl>
        <div className="mt-5 flex gap-1 overflow-x-auto border-b border-default pb-2">
          <button className="border-0 bg-transparent p-2 font-bold text-primary">Payments</button>
          <button className={tabClass}>Maintenance</button>
          <button className={tabClass}>Documents</button>
          <button className={tabClass}>Notices</button>
        </div>
        <Button className="mt-5 w-full" onClick={onClose}>
          Open full tenant record <ChevronRight size={16} />
        </Button>
      </aside>
    </div>
  );
}
