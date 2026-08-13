"use client";

import { useDeferredValue, useState } from "react";
import {
  CircleAlert,
  Clock3,
  Download,
  Home,
  Plus,
  Search,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import TenantDetail from "./TenantDetail";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";

const summaryClass = "flex items-center gap-3 rounded-md border border-default bg-surface p-4";
const summaryContentClass = "grid min-w-0 grid-cols-[auto_1fr] items-end";
const summaryStrongClass = "col-span-full mr-2";
const summaryNoteClass = "truncate font-medium text-muted";
const summaryLabelClass = "col-span-full text-secondary";
const tenantStrongClass = "truncate";
const tenantSmallClass = "truncate text-muted";
const pageButtonClass = "rounded border border-default p-2";

export default function TenantsClient({ tenants }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All tenants");
  const [payment, setPayment] = useState("All payments");
  const [selected, setSelected] = useState(null);
  const { activeLandlord } = useWorkspace();
  const deferredSearch = useDeferredValue(search);
  const scopedTenants = activeLandlord
    ? tenants.filter((tenant) => tenant.landlord === activeLandlord.name)
    : tenants;
  const filtered = scopedTenants.filter(
    (tenant) =>
      `${tenant.name} ${tenant.id} ${tenant.email} ${tenant.property} ${tenant.unit}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()) &&
      (status === "All tenants" || tenant.status === status) &&
      (payment === "All payments" || tenant.payment === payment),
  );

  return (
    <main className="px-8 py-6 max-md:px-4 max-md:py-5">
      <section className="mb-6 flex items-center justify-between gap-5">
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-accent">People / Tenants</p>
          <h1>Tenants</h1>
          <p className="m-0 text-muted">
            Manage tenant profiles, tenancy details, balances and documents.
          </p>
        </div>
        <Button>
          <Plus size={17} /> Add tenant
        </Button>
      </section>
      <section className="mb-3 grid grid-cols-4 gap-3 max-lg:grid-cols-2">
        <div className={summaryClass}>
          <span className="grid size-9 place-items-center rounded-full bg-subtle text-primary">
            <Users size={18} />
          </span>
          <div className={summaryContentClass}>
            <small className={summaryLabelClass}>Total tenants</small>
            <strong className={summaryStrongClass}>289</strong>
            <b className={summaryNoteClass}>Across 24 properties</b>
          </div>
        </div>
        <div className={summaryClass}>
          <span className="grid size-9 place-items-center rounded-full bg-subtle text-primary">
            <Home size={18} />
          </span>
          <div className={summaryContentClass}>
            <small className={summaryLabelClass}>Active leases</small>
            <strong className={summaryStrongClass}>276</strong>
            <b className={summaryNoteClass}>95.5% of tenants</b>
          </div>
        </div>
        <div className={summaryClass}>
          <span className="grid size-9 place-items-center rounded-full bg-subtle text-primary">
            <Clock3 size={18} />
          </span>
          <div className={summaryContentClass}>
            <small className={summaryLabelClass}>Expiring soon</small>
            <strong className={summaryStrongClass}>7</strong>
            <b className={summaryNoteClass}>Within 30 days</b>
          </div>
        </div>
        <div className={summaryClass}>
          <span className="grid size-9 place-items-center rounded-full bg-subtle text-primary">
            <CircleAlert size={18} />
          </span>
          <div className={summaryContentClass}>
            <small className={summaryLabelClass}>With balance</small>
            <strong className={summaryStrongClass}>18</strong>
            <b className={summaryNoteClass}>$53,450 outstanding</b>
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-md border border-default bg-surface">
        <div className="flex items-center gap-2 border-b border-default p-3 max-lg:flex-wrap">
          <label className="flex h-9 w-[300px] items-center gap-2 rounded border border-default bg-subtle px-3 text-muted">
            <Search size={17} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, property or unit"
            />
          </label>
          <select
            className="h-9 rounded border border-default bg-surface px-3 text-secondary"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Tenant status"
          >
            <option>All tenants</option>
            <option>Active</option>
            <option>Expiring</option>
            <option>Notice Given</option>
          </select>
          <select
            className="h-9 rounded border border-default bg-surface px-3 text-secondary"
            value={payment}
            onChange={(event) => setPayment(event.target.value)}
            aria-label="Payment status"
          >
            <option>All payments</option>
            <option>Paid</option>
            <option>Partial</option>
            <option>Overdue</option>
          </select>
          <Button variant="secondary">
            <Download size={16} /> Export
          </Button>
        </div>
        <div className="flex min-h-10 items-center justify-between bg-subtle px-3 text-secondary">
          <span>{filtered.length} tenant records</span>
          <button className="flex items-center gap-1 border-0 bg-transparent text-secondary">
            Sort by: Recently added <ChevronDown size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          {filtered.map((tenant) => (
            <button
              className="grid w-full min-w-[850px] grid-cols-[35px_minmax(170px,1.3fr)_minmax(150px,1.1fr)_100px_85px_65px_17px] items-center gap-2.5 border-0 border-t border-default bg-surface p-3 text-left hover:bg-hover"
              key={tenant.id}
              onClick={() => setSelected(tenant)}
            >
              <span className="grid size-9 place-items-center rounded-full bg-subtle font-bold text-primary">
                {tenant.initials}
              </span>
              <span className="flex min-w-0 flex-col">
                <strong className={tenantStrongClass}>{tenant.name}</strong>
                <small className={tenantSmallClass}>
                  {tenant.id} · {tenant.email}
                </small>
              </span>
              <span className="flex min-w-0 flex-col">
                <strong className={tenantStrongClass}>{tenant.property}</strong>
                <small className={tenantSmallClass}>Unit {tenant.unit}</small>
              </span>
              <span className="flex min-w-0 flex-col">
                <strong className={tenantStrongClass}>{tenant.leaseEnd}</strong>
                <small className={tenantSmallClass}>Lease expiration</small>
              </span>
              <span className="flex min-w-0 flex-col">
                <strong className={tenantStrongClass}>${tenant.rent.toLocaleString()}</strong>
                <small className={tenantSmallClass}>Monthly rent</small>
              </span>
              <span
                className={
                  tenant.payment === "Paid"
                    ? "rounded-full bg-success-subtle px-2 py-1 font-bold text-success"
                    : tenant.payment === "Partial"
                      ? "rounded-full bg-warning-subtle px-2 py-1 font-bold text-warning"
                      : "rounded-full bg-danger-subtle px-2 py-1 font-bold text-danger"
                }
              >
                {tenant.payment}
              </span>
              <ChevronRight size={17} />
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-muted">
            <Users size={30} />
            <strong>No tenants found</strong>
            <span>Adjust the search or tenant filters.</span>
          </div>
        ) : null}
        <div className="flex min-h-12 items-center justify-between border-t border-default p-3 text-muted">
          <span>Showing {filtered.length} sample records from 289 tenants</span>
          <div className="flex gap-1">
            <button className={pageButtonClass} disabled>
              Previous
            </button>
            <button className="rounded border border-primary bg-primary p-2 text-inverse">1</button>
            <button className={pageButtonClass}>2</button>
            <button className={pageButtonClass}>3</button>
            <button className={pageButtonClass}>Next</button>
          </div>
        </div>
      </section>
      <TenantDetail tenant={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
