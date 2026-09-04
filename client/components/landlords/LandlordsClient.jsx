"use client";

import { useDeferredValue, useState } from "react";
import {
  Building2,
  ChevronRight,
  CircleAlert,
  CircleDollarSign,
  Grid3X3,
  Plus,
  Search,
  Users,
} from "lucide-react";
import Button from "@/components/ui/Button";
import LandlordDetail from "./LandlordDetail";
import CreateLandlordDialog from "./CreateLandlordDialog";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import { useSession } from "@/components/auth/SessionProvider";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const STATUS_TABS = ["All", "Active", "Invited", "Inactive"];

const summaryCardClass =
  "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3";
const summaryIconClass = "grid size-9 flex-none place-items-center rounded bg-subtle text-primary";

const rowClass =
  "grid w-full min-w-[820px] grid-cols-[38px_minmax(200px,1.4fr)_minmax(150px,1fr)_110px_120px_100px_17px] items-center gap-2.5 border-0 border-t border-default bg-surface p-3 text-left hover:bg-hover";

const portalPillClass = (portal) =>
  portal === "Active"
    ? "rounded bg-success-subtle px-2 py-1 font-bold text-success"
    : portal === "Invited"
      ? "rounded bg-info-subtle px-2 py-1 font-bold text-info"
      : "rounded bg-subtle px-2 py-1 font-bold text-muted";

export default function LandlordsClient({ landlords, properties }) {
  const [search, setSearch] = useState("");
  const [portal, setPortal] = useState("All");
  const [selected, setSelected] = useState(null);
  const [detailAction, setDetailAction] = useState(null);
  const [creating, setCreating] = useState(false);
  const [sortByAttention, setSortByAttention] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const { openLandlord } = useWorkspace();
  const session = useSession();
  const canCreate = ["ADMIN", "MANAGER"].includes(session?.role);

  const baseFiltered = landlords.filter(
    (landlord) =>
      `${landlord.name} ${landlord.code} ${landlord.email} ${landlord.phone || ""}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()) &&
      (portal === "All" || landlord.portal === portal),
  );
  const filtered = sortByAttention
    ? [...baseFiltered].sort((a, b) => Number(b.attention || 0) - Number(a.attention || 0))
    : baseFiltered;

  const totalUnits = properties.reduce((total, property) => {
    const count = Array.isArray(property.units)
      ? property.units.length
      : Number(property.units || 0);
    return total + count;
  }, 0);
  const totalRent = properties.reduce((total, property) => {
    if (typeof property.rent === "number") return total + property.rent;
    const rent = Array.isArray(property.units)
      ? property.units.reduce((sum, unit) => sum + Number(unit.monthlyRent || 0), 0)
      : Number(property.rent || 0);
    return total + rent;
  }, 0);
  const attentionCount = landlords.filter((landlord) => Number(landlord.attention || 0) > 0).length;

  function openDetails(landlord, action) {
    setDetailAction(action || null);
    setSelected(landlord);
  }

  return (
    <main className="px-8 py-6 max-md:px-4 max-md:pb-8 max-md:pt-5">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:items-start">
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-accent">
            Portfolio / Landlords
          </p>
          <h1 className="mb-1 font-medium">Landlords</h1>
          <p className="m-0 text-muted">
            Review and manage every landlord portfolio in the agency.
          </p>
        </div>
        {canCreate ? (
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} /> Add landlord
          </Button>
        ) : null}
      </section>

      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <Users size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Total landlords</small>
            <strong>{landlords.length}</strong>
            <small className="truncate text-muted">{properties.length} managed properties</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <Grid3X3 size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Portfolio units</small>
            <strong>{totalUnits}</strong>
            <small className="truncate text-muted">Across all portfolios</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <CircleDollarSign size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Expected monthly rent</small>
            <strong>{money.format(totalRent)}</strong>
            <small className="truncate text-muted">Across all portfolios</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            {attentionCount > 0 ? <CircleAlert size={18} /> : <Building2 size={18} />}
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Needs attention</small>
            <strong>{attentionCount}</strong>
            <small className="truncate text-muted">
              {landlords.reduce((sum, landlord) => sum + Number(landlord.attention || 0), 0)}{" "}
              overdue rent items
            </small>
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
              placeholder="Search name, code, email or phone"
            />
          </label>
          <div className="flex flex-1 items-center gap-1 overflow-x-auto max-lg:order-3 max-lg:basis-full">
            {STATUS_TABS.map((item) => (
              <button
                className={
                  portal === item
                    ? "h-8 whitespace-nowrap rounded border-0 bg-hover px-2.5 font-bold text-primary"
                    : "h-8 whitespace-nowrap rounded border-0 bg-transparent px-2.5 text-secondary hover:bg-hover"
                }
                onClick={() => setPortal(item)}
                key={item}
              >
                {item}
              </button>
            ))}
            <button
              className={`ml-1 h-8 whitespace-nowrap rounded border px-2.5 ${
                sortByAttention
                  ? "border-primary bg-primary font-bold text-inverse"
                  : "border-default bg-surface text-secondary hover:bg-hover"
              }`}
              onClick={() => setSortByAttention((current) => !current)}
              aria-pressed={sortByAttention}
            >
              Attention first
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.map((landlord) => (
            <button
              className={rowClass}
              key={landlord.id}
              onClick={() => openDetails(landlord, null)}
            >
              <span className="grid size-9 place-items-center rounded bg-sidebar font-bold text-inverse">
                {landlord.initials}
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <small className="text-muted">{landlord.code}</small>
                <strong className="truncate text-primary">{landlord.name}</strong>
                <small className="truncate text-muted">{landlord.email}</small>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className="text-primary">{landlord.properties}</strong>
                <small className="text-muted">Properties</small>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className="text-primary">{landlord.units}</strong>
                <small className="text-muted">Units</small>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className="text-primary">{money.format(landlord.monthlyRent)}</strong>
                <small className="text-muted">Monthly rent</small>
              </span>
              <span
                className={`${portalPillClass(landlord.portal)} ${
                  Number(landlord.attention || 0) > 0 ? "relative" : ""
                }`}
                title={
                  Number(landlord.attention || 0) > 0
                    ? `${landlord.attention} overdue rent items`
                    : undefined
                }
              >
                {Number(landlord.attention || 0) > 0 ? (
                  <i className="absolute -right-1 -top-1 size-2 rounded-full bg-danger" />
                ) : null}
                {landlord.portal}
              </span>
              <ChevronRight size={17} />
            </button>
          ))}
          {filtered.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-muted">
              <Users size={30} />
              <strong>No landlords found</strong>
              <span>Adjust the search or portal filter.</span>
            </div>
          ) : null}
        </div>
        <div className="flex min-h-12 items-center justify-between border-t border-default px-3 text-muted">
          <span>
            Showing {filtered.length} of {landlords.length} landlords
          </span>
        </div>
      </section>

      <LandlordDetail
        key={selected ? selected.id : "none"}
        landlord={selected}
        initialAction={detailAction}
        properties={properties}
        onClose={() => {
          setSelected(null);
          setDetailAction(null);
        }}
      />
      {creating ? <CreateLandlordDialog onClose={() => setCreating(false)} /> : null}
    </main>
  );
}
