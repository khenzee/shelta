"use client";

import { useDeferredValue, useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Plus,
  Search,
  Users,
} from "lucide-react";
import Button from "@/components/ui/Button";
import LandlordDetail from "./LandlordDetail";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";

const summaryClass = "flex min-w-0 flex-col gap-1 border-r border-default p-4";
const summaryLabelClass = "text-secondary";
const summaryNoteClass = "text-muted";
const landlordMetricClass = "flex items-center gap-2 border-r border-default p-2";
const landlordMetricTextClass = "flex flex-col";

export default function LandlordsClient({ landlords, properties }) {
  const [search, setSearch] = useState("");
  const [portal, setPortal] = useState("All portal statuses");
  const [selected, setSelected] = useState(null);
  const deferredSearch = useDeferredValue(search);
  const { openLandlord } = useWorkspace();
  const filtered = landlords.filter(
    (landlord) =>
      `${landlord.name} ${landlord.id} ${landlord.email}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()) &&
      (portal === "All portal statuses" || landlord.portal === portal),
  );

  return (
    <main className="px-8 py-6 max-md:px-4 max-md:py-5">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:items-start">
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-accent">
            Portfolio / Landlords
          </p>
          <h1>Landlords</h1>
          <p className="m-0 text-muted">
            Select a landlord to review and manage their complete real estate portfolio.
          </p>
        </div>
        <Button>
          <Plus size={16} /> Add landlord
        </Button>
      </section>

      <section className="mb-3.5 grid grid-cols-4 rounded-md border border-default bg-surface max-lg:grid-cols-2">
        <div className={summaryClass}>
          <span className={summaryLabelClass}>Total landlords</span>
          <strong>6</strong>
          <small className={summaryNoteClass}>24 managed properties</small>
        </div>
        <div className={summaryClass}>
          <span className={summaryLabelClass}>Portfolio units</span>
          <strong>312</strong>
          <small className={summaryNoteClass}>289 occupied</small>
        </div>
        <div className={summaryClass}>
          <span className={summaryLabelClass}>Expected monthly rent</span>
          <strong>$482,100</strong>
          <small className={summaryNoteClass}>Across all portfolios</small>
        </div>
        <div className="flex min-w-0 flex-col gap-1 p-4">
          <span className={summaryLabelClass}>Needs attention</span>
          <strong>12</strong>
          <small className={summaryNoteClass}>Across 5 landlords</small>
        </div>
      </section>

      <section className="rounded-md border border-default bg-surface">
        <div className="flex items-center gap-2 border-b border-default p-3 max-md:flex-wrap">
          <label className="flex h-9 w-75 items-center gap-2 rounded border border-default bg-subtle px-3 text-muted">
            <Search size={16} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search landlord, email or ID"
            />
          </label>
          <select
            className="h-9 rounded border border-default bg-surface px-3 text-secondary"
            value={portal}
            onChange={(event) => setPortal(event.target.value)}
            aria-label="Portal status"
          >
            <option>All portal statuses</option>
            <option>Active</option>
            <option>Invited</option>
            <option>Inactive</option>
          </select>
          <button className="flex h-9 items-center gap-1 rounded border border-default bg-surface px-3 text-secondary">
            Sort: Attention first <ChevronDown size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 max-sm:grid-cols-1">
          {filtered.map((landlord, index) => (
            <article
              className={`${
                index % 2 === 0 ? "border-r max-sm:border-r-0" : ""
              } min-w-0 border-b border-default`}
              key={landlord.id}
            >
              <button
                className="grid w-full grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-2.5 border-0 bg-surface p-3.5 text-left hover:bg-hover"
                onClick={() => setSelected(landlord)}
              >
                <span className="grid size-9 place-items-center rounded bg-sidebar text-inverse">
                  {landlord.initials}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <small className="text-muted">{landlord.id}</small>
                  <strong>{landlord.name}</strong>
                  <b className="truncate font-normal text-muted">{landlord.email}</b>
                </span>
                <span
                  className={
                    landlord.portal === "Active"
                      ? "rounded bg-success-subtle px-2 py-1 text-success font-bold"
                      : landlord.portal === "Invited"
                        ? "rounded bg-info-subtle px-2 py-1 text-info font-bold"
                        : "rounded bg-subtle px-2 py-1 text-muted font-bold"
                  }
                >
                  {landlord.portal}
                </span>
              </button>

              <div className="mx-3.5 grid grid-cols-3 rounded border border-default">
                <div className={landlordMetricClass}>
                  <Building2 size={14} />
                  <span className={landlordMetricTextClass}>
                    <b>{landlord.properties}</b>
                    <small>Properties</small>
                  </span>
                </div>
                <div className={landlordMetricClass}>
                  <Users size={14} />
                  <span className={landlordMetricTextClass}>
                    <b>{landlord.units}</b>
                    <small>Units</small>
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2">
                  <CircleAlert size={14} />
                  <span className={landlordMetricTextClass}>
                    <b>{landlord.attention}</b>
                    <small>Attention</small>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 p-3.5 text-secondary">
                <span>${landlord.monthlyRent.toLocaleString()} expected monthly</span>
                <button
                  className="flex items-center gap-1 border-0 bg-transparent text-primary"
                  onClick={() => openLandlord(landlord.id)}
                >
                  Open workspace <ChevronRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-muted">
            <Users size={28} />
            <strong>No landlords found</strong>
            <span>Adjust the search or portal filter.</span>
          </div>
        ) : null}
      </section>

      <LandlordDetail
        landlord={selected}
        properties={properties}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}
