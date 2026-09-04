"use client";

import { useDeferredValue, useState } from "react";
import {
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  FileClock,
  FileText,
  Plus,
  Search,
} from "lucide-react";
import Button from "@/components/ui/Button";
import LeaseDetail from "./LeaseDetail";
import CreateLeaseDialog from "./CreateLeaseDialog";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import { useSession } from "@/components/auth/SessionProvider";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const STATUS_TABS = ["All", "Active", "Expiring", "Draft", "Terminated", "Expired", "Renewed"];

const summaryCardClass =
  "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3";
const summaryIconClass = "grid size-9 flex-none place-items-center rounded bg-subtle text-primary";

const statusPillClass = (status) =>
  status === "Active"
    ? "inline-flex rounded bg-success-subtle px-2 py-1 font-bold text-success"
    : status === "Expiring"
      ? "inline-flex rounded bg-warning-subtle px-2 py-1 font-bold text-warning"
      : status === "Draft"
        ? "inline-flex rounded bg-info-subtle px-2 py-1 font-bold text-info"
        : "inline-flex rounded bg-subtle px-2 py-1 font-bold text-muted";

const tableHeaderClass = "h-[37px] bg-sidebar px-3 text-left font-semibold uppercase text-muted";
const tableCellClass =
  "h-[62px] whitespace-nowrap border-t border-default px-3 py-2 text-secondary";
const tablePrimaryClass = "block max-w-[170px] overflow-hidden text-ellipsis text-primary";
const tableSecondaryClass = "mt-1 block text-muted";

const documentRowClass =
  "grid grid-cols-[38px_minmax(180px,1.6fr)_150px_130px_90px_17px] items-center gap-3 border-t border-default px-3 py-3 text-secondary max-md:min-w-[700px]";

export default function LeasesClient({ leases, documents, tenants, units }) {
  const [view, setView] = useState("leases");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState(null);
  const [detailAction, setDetailAction] = useState(null);
  const [creating, setCreating] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const { activeLandlord } = useWorkspace();
  const session = useSession();
  const canCreate = ["ADMIN", "MANAGER"].includes(session?.role);

  const scopedLeases = activeLandlord
    ? leases.filter((lease) => lease.landlordId === activeLandlord.id)
    : leases;
  const scopedDocuments = activeLandlord
    ? documents.filter((document) => document.landlordId === activeLandlord.id)
    : documents;
  const scopedTenants = activeLandlord
    ? tenants.filter(
        (tenant) =>
          tenant.landlordId === activeLandlord.id || tenant.landlord === activeLandlord.name,
      )
    : tenants;

  const filteredLeases = scopedLeases.filter(
    (lease) =>
      `${lease.tenant} ${lease.property} ${lease.unit} ${lease.landlord} ${lease.id}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()) &&
      (status === "All" || lease.status === status),
  );
  const filteredDocuments = scopedDocuments.filter((document) =>
    `${document.name} ${document.category} ${document.uploadedBy}`
      .toLowerCase()
      .includes(deferredSearch.toLowerCase()),
  );

  const activeCount = scopedLeases.filter((lease) =>
    ["Active", "Expiring"].includes(lease.status),
  ).length;
  const expiringCount = scopedLeases.filter((lease) => lease.expiringSoon).length;
  const monthlyTotal = scopedLeases
    .filter((lease) => ["Active", "Expiring"].includes(lease.status))
    .reduce((sum, lease) => sum + Number(lease.rent || 0), 0);

  function openDetails(lease, action) {
    setDetailAction(action || null);
    setSelected(lease);
  }

  return (
    <main className="px-8 py-6 max-md:px-4 max-md:pb-8 max-md:pt-5">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:items-start">
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-accent">
            Operations / Leases and documents
          </p>
          <h1 className="mb-1 font-medium">
            {activeLandlord ? `${activeLandlord.name}'s legal records` : "Leases and documents"}
          </h1>
          <p className="m-0 text-muted">Manage agreements, lease terms and stored legal records.</p>
        </div>
        {canCreate ? (
          <Button onClick={() => setCreating(true)}>
            <Plus size={15} /> Create lease
          </Button>
        ) : null}
      </section>

      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <FileText size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Active leases</small>
            <strong>{activeCount}</strong>
            <small className="truncate text-muted">Current agreements</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <FileClock size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Expiring soon</small>
            <strong>{expiringCount}</strong>
            <small className="truncate text-muted">Within 60 days</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <CircleDollarSign size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Monthly rent</small>
            <strong>{money.format(monthlyTotal)}</strong>
            <small className="truncate text-muted">Under active leases</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <FileCheck2 size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Stored documents</small>
            <strong>{scopedDocuments.length}</strong>
            <small className="truncate text-muted">In the vault</small>
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-default bg-surface">
        <div className="flex h-10 items-end gap-1 border-b border-default px-3">
          <button
            className={
              view === "leases"
                ? "h-[35px] border-0 border-b-2 border-primary bg-transparent px-2.5 font-semibold text-primary"
                : "h-[35px] border-0 border-b-2 border-transparent bg-transparent px-2.5 text-secondary"
            }
            onClick={() => setView("leases")}
          >
            Leases
          </button>
          <button
            className={
              view === "documents"
                ? "h-[35px] border-0 border-b-2 border-primary bg-transparent px-2.5 font-semibold text-primary"
                : "h-[35px] border-0 border-b-2 border-transparent bg-transparent px-2.5 text-secondary"
            }
            onClick={() => setView("documents")}
          >
            Document vault
          </button>
        </div>
        <div className="flex items-center gap-2 border-b border-default p-3 max-md:flex-wrap">
          <label className="flex h-9 w-[280px] items-center gap-2 rounded border border-default bg-subtle px-2.5 text-muted max-md:flex-1">
            <Search size={16} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-primary outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                view === "leases" ? "Search tenant, property or unit" : "Search documents"
              }
            />
          </label>
          {view === "leases" ? (
            <div className="flex flex-1 items-center gap-1 overflow-x-auto max-md:order-3 max-md:basis-full">
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
          ) : null}
        </div>
        {view === "leases" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr>
                  <th className={tableHeaderClass}>Tenant and unit</th>
                  <th className={tableHeaderClass}>Property</th>
                  <th className={tableHeaderClass}>Lease period</th>
                  <th className={tableHeaderClass}>Rent</th>
                  <th className={tableHeaderClass}>Agreement</th>
                  <th className={tableHeaderClass}>Status</th>
                  <th className={tableHeaderClass} />
                </tr>
              </thead>
              <tbody>
                {filteredLeases.map((lease) => (
                  <tr
                    className="cursor-pointer hover:bg-hover"
                    key={lease.id}
                    onClick={() => openDetails(lease, null)}
                  >
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{lease.tenant}</b>
                      <small className={tableSecondaryClass}>Unit {lease.unit}</small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{lease.property}</b>
                      <small className={tableSecondaryClass}>{lease.landlord}</small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{lease.end || "—"}</b>
                      <small className={tableSecondaryClass}>
                        {lease.daysLeft !== null && lease.daysLeft > 0
                          ? `${lease.daysLeft} days left`
                          : `Started ${lease.start || "—"}`}
                      </small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{money.format(lease.rent)}</b>
                      <small className={tableSecondaryClass}>{lease.schedule}</small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{lease.signed ? "On file" : "None"}</b>
                      <small className={tableSecondaryClass}>
                        {lease.signed ? "Signed and stored" : "Awaiting signature"}
                      </small>
                    </td>
                    <td className={tableCellClass}>
                      <span className={statusPillClass(lease.status)}>{lease.status}</span>
                    </td>
                    <td className={tableCellClass}>
                      <ChevronRight size={16} />
                    </td>
                  </tr>
                ))}
                {filteredLeases.length === 0 ? (
                  <tr>
                    <td className="border-t border-default p-10 text-center text-muted" colSpan={7}>
                      <FileText className="mx-auto mb-2" size={30} />
                      <b className="block text-secondary">No leases found</b>
                      Adjust the search or status filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="max-md:overflow-x-auto">
            {filteredDocuments.map((document) => (
              <article className={documentRowClass} key={document.id}>
                <span className="grid h-8 w-8 place-items-center rounded bg-subtle text-primary">
                  <FileText size={18} />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <strong className="truncate text-primary">{document.name}</strong>
                  <small className="truncate text-muted">
                    {document.category} · Uploaded by {document.uploadedBy}
                  </small>
                </div>
                <div className="flex flex-col gap-1">
                  <small className="text-muted">Uploaded</small>
                  <b className="text-primary">{document.created}</b>
                </div>
                <div className="flex flex-col gap-1">
                  <small className="text-muted">Type</small>
                  <b className="text-primary">{document.description || "—"}</b>
                </div>
                <span className="inline-flex w-max rounded bg-success-subtle px-2 py-1 font-bold text-success">
                  {document.status}
                </span>
                <ChevronRight size={16} className="text-muted" />
              </article>
            ))}
            {filteredDocuments.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-muted">
                <FileText size={30} />
                <strong>No documents stored yet</strong>
                <span>Uploaded agreements and legal files will appear here.</span>
              </div>
            ) : null}
          </div>
        )}
        <div className="flex min-h-12 items-center justify-between border-t border-default px-3 text-muted">
          <span>
            {view === "leases"
              ? `Showing ${filteredLeases.length} of ${scopedLeases.length} leases`
              : `${filteredDocuments.length} documents`}
          </span>
        </div>
      </section>

      <LeaseDetail
        key={selected ? selected.id : "none"}
        lease={selected}
        initialAction={detailAction}
        onClose={() => {
          setSelected(null);
          setDetailAction(null);
        }}
      />
      {creating ? (
        <CreateLeaseDialog
          tenants={scopedTenants}
          units={units}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </main>
  );
}
