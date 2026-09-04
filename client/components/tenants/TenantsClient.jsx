"use client";

import { useDeferredValue, useState } from "react";
import {
  CircleAlert,
  Clock3,
  Download,
  FileCheck2,
  MailX,
  Plus,
  Search,
  Users,
  ChevronRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import TenantDetail from "./TenantDetail";
import CreateTenantDialog from "./CreateTenantDialog";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import { useSession } from "@/components/auth/SessionProvider";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const STATUS_TABS = ["All", "Active", "Notice Given", "Former", "Archived"];

const statusPillClass = (status) =>
  status === "Active"
    ? "rounded-full bg-success-subtle px-2 py-1 font-bold text-success"
    : status === "Notice Given"
      ? "rounded-full bg-warning-subtle px-2 py-1 font-bold text-warning"
      : status === "Former"
        ? "rounded-full bg-subtle px-2 py-1 font-bold text-muted"
        : "rounded-full bg-danger-subtle px-2 py-1 font-bold text-danger";

const rowClass =
  "grid w-full min-w-[860px] grid-cols-[35px_minmax(180px,1.4fr)_minmax(160px,1.1fr)_130px_120px_110px_17px] items-center gap-2.5 border-0 border-t border-default bg-surface p-3 text-left hover:bg-hover";

export default function TenantsClient({ tenants, landlords = [], properties = [], units = [] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [detailAction, setDetailAction] = useState(null);
  const [creating, setCreating] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const { activeLandlord } = useWorkspace();
  const session = useSession();
  const canCreate = ["ADMIN", "MANAGER"].includes(session?.role);

  const scopedTenants = activeLandlord
    ? tenants.filter(
        (tenant) =>
          tenant.landlordId === activeLandlord.id || tenant.landlord === activeLandlord.name,
      )
    : tenants;
  const filtered = scopedTenants.filter(
    (tenant) =>
      `${tenant.name} ${tenant.email} ${tenant.property} ${tenant.unit} ${tenant.landlord}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()) &&
      (status === "All" || tenant.status === status),
  );

  const activeLeaseCount = scopedTenants.filter((tenant) => tenant.leaseStatus).length;
  const expiringCount = scopedTenants.filter((tenant) => tenant.expiringSoon).length;
  const unverifiedCount = scopedTenants.filter((tenant) => !tenant.emailVerified).length;

  function openDetails(tenant, action) {
    setDetailAction(action || null);
    setSelected(tenant);
  }

  function exportCsv() {
    const rows = [
      [
        "Name",
        "Email",
        "Phone",
        "Property",
        "Unit",
        "Landlord",
        "Lease status",
        "Lease ends",
        "Monthly rent",
      ],
      ...filtered.map((tenant) => [
        tenant.name,
        tenant.email,
        tenant.phone === "Not provided" ? "" : tenant.phone,
        tenant.property,
        tenant.unit,
        tenant.landlord,
        tenant.leaseStatus || "",
        tenant.leaseEnd || "",
        tenant.rent,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `shelta-tenants-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="px-8 py-6 max-md:px-4 max-md:pb-8 max-md:pt-5">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:items-start">
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-accent">People / Tenants</p>
          <h1 className="mb-1 font-medium">Tenants</h1>
          <p className="m-0 text-muted">
            Manage tenant profiles, tenancy details and lease records.
          </p>
        </div>
        {canCreate ? (
          <Button onClick={() => setCreating(true)}>
            <Plus size={17} /> Add tenant
          </Button>
        ) : null}
      </section>

      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className="flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3">
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            <Users size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Total tenants</small>
            <strong>{scopedTenants.length}</strong>
            <small className="truncate text-muted">Visible records</small>
          </span>
        </div>
        <div className="flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3">
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            <FileCheck2 size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Active leases</small>
            <strong>{activeLeaseCount}</strong>
            <small className="truncate text-muted">
              {scopedTenants.length
                ? ((activeLeaseCount / scopedTenants.length) * 100).toFixed(1)
                : 0}
              % of tenants
            </small>
          </span>
        </div>
        <div className="flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3">
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            <Clock3 size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Expiring soon</small>
            <strong>{expiringCount}</strong>
            <small className="truncate text-muted">Within 60 days</small>
          </span>
        </div>
        <div className="flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3">
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            {unverifiedCount > 0 ? <CircleAlert size={18} /> : <MailX size={18} />}
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Email unverified</small>
            <strong>{unverifiedCount}</strong>
            <small className="truncate text-muted">Awaiting verification</small>
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-default bg-surface">
        <div className="flex items-center gap-2 border-b border-default p-3 max-lg:flex-wrap">
          <label className="flex h-9 w-[280px] items-center gap-2 rounded border border-default bg-subtle px-2.5 text-muted max-md:flex-1">
            <Search size={17} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-primary outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, property or unit"
            />
          </label>
          <div className="flex flex-1 items-center gap-1 overflow-x-auto max-lg:order-3 max-lg:basis-full">
            {STATUS_TABS.map((item) => (
              <button
                className={
                  status === item
                    ? "h-8 whitespace-nowrap rounded border-0 bg-hover px-2.5 font-bold text-primary"
                    : "h-8 whitespace-nowrap rounded border-0 bg-transparent px-2.5 text-secondary hover:bg-hover"
                }
                onClick={() => setStatus(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          <Button variant="secondary" onClick={exportCsv}>
            <Download size={16} /> Export
          </Button>
        </div>

        <div className="overflow-x-auto">
          {filtered.map((tenant) => (
            <button className={rowClass} key={tenant.id} onClick={() => openDetails(tenant, null)}>
              <span className="grid size-9 place-items-center rounded-full bg-subtle font-bold text-primary">
                {tenant.initials}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className="truncate text-primary">{tenant.name}</strong>
                <small className="truncate text-muted">{tenant.email}</small>
                <small className={tenant.emailVerified ? "text-success" : "text-warning"}>
                  {tenant.emailVerified ? "Email verified" : "Email unverified"}
                </small>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className="truncate text-primary">{tenant.property}</strong>
                <small className="truncate text-muted">Unit {tenant.unit}</small>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className={tenant.expiringSoon ? "text-warning" : "text-primary"}>
                  {tenant.leaseEnd || "—"}
                </strong>
                <small className="text-muted">
                  {tenant.leaseDaysLeft !== null && tenant.leaseDaysLeft > 0
                    ? `${tenant.leaseDaysLeft} days left`
                    : "Lease end"}
                </small>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className="text-primary">{money.format(tenant.rent)}</strong>
                <small className="text-muted">Monthly rent</small>
              </span>
              <span className={statusPillClass(tenant.status)}>{tenant.status}</span>
              <ChevronRight size={17} />
            </button>
          ))}
          {filtered.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-muted">
              <Users size={30} />
              <strong>No tenants found</strong>
              <span>Adjust the search or status filter.</span>
            </div>
          ) : null}
        </div>
        <div className="flex min-h-12 items-center justify-between border-t border-default px-3 text-muted">
          <span>
            Showing {filtered.length} of {scopedTenants.length} tenants
          </span>
        </div>
      </section>

      <TenantDetail
        key={selected ? selected.id : "none"}
        tenant={selected}
        initialAction={detailAction}
        onClose={() => {
          setSelected(null);
          setDetailAction(null);
        }}
      />
      {creating ? (
        <CreateTenantDialog
          landlords={landlords}
          properties={properties}
          units={units}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </main>
  );
}
