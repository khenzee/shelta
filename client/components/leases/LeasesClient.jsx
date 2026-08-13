"use client";

import { useDeferredValue, useState } from "react";
import {
  ChevronDown,
  Download,
  FileCheck2,
  FileClock,
  FileText,
  Mail,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import ComposeMessage from "./ComposeMessage";

const summaryCardClass =
  "flex items-center gap-2.5 rounded-md border border-default bg-surface p-3.5";
const summaryIconClass =
  "grid h-[34px] w-[34px] flex-none place-items-center rounded bg-subtle text-primary";
const summaryBodyClass = "flex min-w-0 flex-col gap-0.5";
const summarySmallClass = "text-secondary";
const summaryStrongClass = "text-primary";
const summaryDetailClass = "font-normal text-muted";
const tableHeaderClass = "h-[37px] bg-sidebar px-3 font-semibold uppercase text-muted";
const tableCellClass =
  "h-[62px] whitespace-nowrap border-t border-default px-3 py-2 text-secondary";
const tablePrimaryClass = "block max-w-[170px] overflow-hidden text-ellipsis text-primary";
const tableSecondaryClass = "mt-1 block text-muted";
const documentRowClass =
  "grid grid-cols-[38px_minmax(180px,1.5fr)_1fr_70px_90px_85px_24px] items-center gap-3 border-t border-default px-3 py-3 text-secondary max-md:min-w-[760px]";
const documentDetailClass = "flex flex-col gap-1";

export default function LeasesClient({ leases, documents, tenants }) {
  const [view, setView] = useState("leases");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [composerOpen, setComposerOpen] = useState(false);
  const [recipient, setRecipient] = useState("");
  const deferredSearch = useDeferredValue(search);
  const { activeLandlord } = useWorkspace();
  const scopedLeases = activeLandlord
    ? leases.filter((lease) => lease.landlord === activeLandlord.name)
    : leases;
  const scopedDocuments = activeLandlord
    ? documents.filter((document) => document.landlord === activeLandlord.name)
    : documents;
  const scopedTenants = activeLandlord
    ? tenants.filter((tenant) => tenant.landlord === activeLandlord.name)
    : tenants;
  const filteredLeases = scopedLeases.filter(
    (lease) =>
      `${lease.tenant} ${lease.property} ${lease.id}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()) &&
      (status === "All statuses" || lease.status === status),
  );
  const filteredDocuments = scopedDocuments.filter((document) =>
    `${document.name} ${document.owner} ${document.property}`
      .toLowerCase()
      .includes(deferredSearch.toLowerCase()),
  );

  function emailTenant(tenant) {
    setRecipient(scopedTenants.find((item) => item.name === tenant)?.email || "");
    setComposerOpen(true);
  }

  return (
    <main className="p-8 max-md:p-4">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:flex-col max-md:items-start">
        <div>
          <p className="section-kicker">Operations / Leases and documents</p>
          <h1>
            {activeLandlord ? `${activeLandlord.name}'s legal records` : "Leases and documents"}
          </h1>
          <p>Manage agreements, legal files, version history, access, and tenant delivery.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setComposerOpen(true)}>
            <Mail size={15} /> Email tenant
          </Button>
          <Button>
            <Plus size={15} /> Create lease
          </Button>
        </div>
      </section>
      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <FileText size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className={summarySmallClass}>Active leases</small>
            <strong className={summaryStrongClass}>
              {scopedLeases.filter((item) => item.status === "Active").length}
            </strong>
            <b className={summaryDetailClass}>Current agreements</b>
          </div>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <FileClock size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className={summarySmallClass}>Expiring soon</small>
            <strong className={summaryStrongClass}>
              {scopedLeases.filter((item) => item.status === "Expiring").length}
            </strong>
            <b className={summaryDetailClass}>Within 30 days</b>
          </div>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <FileCheck2 size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className={summarySmallClass}>Stored documents</small>
            <strong className={summaryStrongClass}>{scopedDocuments.length}</strong>
            <b className={summaryDetailClass}>Version controlled</b>
          </div>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <Mail size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className={summarySmallClass}>Sent this month</small>
            <strong className={summaryStrongClass}>18</strong>
            <b className={summaryDetailClass}>To tenants and landlords</b>
          </div>
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
          <label className="flex h-9 w-[300px] items-center gap-[7px] rounded border border-default bg-sidebar px-2.5 text-muted max-md:w-full">
            <Search size={16} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${view}`}
            />
          </label>
          {view === "leases" ? (
            <select
              className="h-9 min-w-[135px] rounded border border-default bg-surface px-2.5 text-primary outline-none"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Expiring</option>
              <option>Termination</option>
            </select>
          ) : (
            <Button variant="secondary">
              <Upload size={14} /> Upload document
            </Button>
          )}
          <button className="ml-auto flex h-[38px] items-center justify-center gap-[7px] rounded-md border border-default bg-surface px-[13px] font-semibold text-primary">
            Recently updated <ChevronDown size={14} />
          </button>
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
                  <tr key={lease.id}>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{lease.tenant}</b>
                      <small className={tableSecondaryClass}>
                        {lease.id} · Unit {lease.unit}
                      </small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{lease.property}</b>
                      <small className={tableSecondaryClass}>{lease.landlord}</small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{lease.end}</b>
                      <small className={tableSecondaryClass}>Started {lease.start}</small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>${lease.rent.toLocaleString()}</b>
                      <small className={tableSecondaryClass}>{lease.schedule}</small>
                    </td>
                    <td className={tableCellClass}>
                      <b className={tablePrimaryClass}>{lease.document}</b>
                      <small className={tableSecondaryClass}>
                        {lease.signed ? "Signed and stored" : "Awaiting signature"}
                      </small>
                    </td>
                    <td className={tableCellClass}>
                      <span
                        className={
                          lease.status === "Expiring"
                            ? "inline-flex rounded bg-warning-subtle px-[7px] py-1 font-bold text-warning"
                            : lease.status === "Termination"
                              ? "inline-flex rounded bg-danger-subtle px-[7px] py-1 font-bold text-danger"
                              : "inline-flex rounded bg-success-subtle px-[7px] py-1 font-bold text-success"
                        }
                      >
                        {lease.status}
                      </span>
                    </td>
                    <td className={tableCellClass}>
                      <button
                        className="border-0 bg-transparent text-secondary"
                        onClick={() => emailTenant(lease.tenant)}
                        aria-label={`Email ${lease.tenant}`}
                      >
                        <Mail size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
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
                <div className={`${documentDetailClass} min-w-0`}>
                  <strong className="text-primary">{document.name}</strong>
                  <small className="text-muted">
                    {document.id} · {document.category} · {document.owner}
                  </small>
                </div>
                <div className={documentDetailClass}>
                  <small className="text-muted">Property</small>
                  <b className="text-primary">{document.property}</b>
                </div>
                <div className={documentDetailClass}>
                  <small className="text-muted">Version</small>
                  <b className="text-primary">v{document.version}</b>
                </div>
                <div className={documentDetailClass}>
                  <small className="text-muted">Access</small>
                  <b className="text-primary">{document.access}</b>
                </div>
                <span className="inline-flex w-max rounded bg-subtle px-[7px] py-1 font-bold text-primary">
                  {document.status}
                </span>
                <button
                  className="border-0 bg-transparent text-secondary"
                  aria-label={`Download ${document.name}`}
                >
                  <Download size={15} />
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
      {composerOpen ? (
        <ComposeMessage
          tenants={scopedTenants}
          documents={scopedDocuments}
          initialRecipient={recipient}
          onClose={() => {
            setComposerOpen(false);
            setRecipient("");
          }}
        />
      ) : null}
    </main>
  );
}
