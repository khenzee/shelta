"use client";

import { useState, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  Grid2X2,
  Grid3X3,
  List,
  MapPin,
  Plus,
  Search,
  Users,
  Ellipsis,
} from "lucide-react";
import PropertyDetail from "./PropertyDetail";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import { useSession } from "@/components/auth/SessionProvider";
import CreatePropertyDialog from "./CreatePropertyDialog";

const STATUS_TABS = ["All", "Active", "Vacant", "Under Maintenance", "Sold"];

const SORT_OPTIONS = [
  { id: "updated", label: "Recently updated" },
  { id: "name", label: "Name A-Z" },
  { id: "occupancy", label: "Occupancy" },
];

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const statusBadgeClass = (status) =>
  status === "Active"
    ? "shrink-0 rounded bg-success-subtle px-2 py-1 font-bold text-success"
    : status === "Vacant"
      ? "shrink-0 rounded bg-warning-subtle px-2 py-1 font-bold text-warning"
      : status === "Under Maintenance"
        ? "shrink-0 rounded bg-info-subtle px-2 py-1 font-bold text-info"
        : "shrink-0 rounded bg-subtle px-2 py-1 font-bold text-muted";

export default function PropertiesClient({ properties, landlords = [] }) {
  const router = useRouter();
  const [globalSearch, setGlobalSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [layout, setLayout] = useState("grid");
  const [selected, setSelected] = useState(null);
  const [detailAction, setDetailAction] = useState(null);
  const [creating, setCreating] = useState(false);
  const [sort, setSort] = useState("updated");
  const [sortOpen, setSortOpen] = useState(false);
  const [menuFor, setMenuFor] = useState(null);
  const { activeLandlord } = useWorkspace();
  const session = useSession();
  const canCreate = ["ADMIN", "MANAGER"].includes(session?.role);

  const deferredSearch = useDeferredValue(globalSearch);
  const scopedProperties = activeLandlord
    ? properties.filter(
        (property) =>
          property.landlordId === activeLandlord.id || property.landlord === activeLandlord.name,
      )
    : properties;
  const filtered = scopedProperties.filter((property) => {
    const matchesSearch =
      `${property.name} ${property.address} ${property.landlord} ${property.code}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase());
    return matchesSearch && (status === "All" || property.status === status);
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "occupancy") {
      const aRate = a.units ? a.occupied / a.units : 0;
      const bRate = b.units ? b.occupied / b.units : 0;
      return bRate - aRate;
    }
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });
  const totalUnits = scopedProperties.reduce((total, item) => total + Number(item.units || 0), 0);
  const occupiedUnits = scopedProperties.reduce(
    (total, item) => total + Number(item.occupied || 0),
    0,
  );
  const monthlyRent = scopedProperties.reduce((total, item) => total + Number(item.rent || 0), 0);

  function openDetails(property, action) {
    setDetailAction(action || null);
    setSelected(property);
  }

  async function archiveFromMenu(property) {
    if (!window.confirm(`Archive ${property.name}?`)) return;
    const response = await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
    if (response.ok) {
      setSelected(null);
      router.refresh();
      return;
    }
    const payload = await response.json().catch(() => ({}));
    window.alert(payload.message || payload.error || "Unable to archive property");
  }

  return (
    <main className="px-8 py-6 max-md:px-4 max-md:pb-8 max-md:pt-5">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:items-start">
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-accent">
            Portfolio / Properties
          </p>
          <h2 className="mb-1 font-medium">Properties</h2>
          <p className="m-0 text-muted">
            Manage buildings, units, occupancy and ownership records.
          </p>
        </div>
        {canCreate ? (
          <button
            onClick={() => setCreating(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-3 font-semibold text-inverse"
          >
            <Plus size={17} /> Add property
          </button>
        ) : null}
      </section>

      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className="flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3">
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            <Building2 size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">
              {activeLandlord ? "Landlord portfolio" : "Total portfolio"}
            </small>
            <strong>{scopedProperties.length}</strong>
            <small className="truncate text-muted">properties</small>
          </span>
        </div>
        <div className="flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3">
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            <Grid3X3 size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Total units</small>
            <strong>{totalUnits}</strong>
            <small className="truncate text-muted">across visible properties</small>
          </span>
        </div>
        <div className="flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3">
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            <Users size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Occupied</small>
            <strong>{occupiedUnits}</strong>
            <small className="truncate text-muted">
              {totalUnits ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0}% occupancy
            </small>
          </span>
        </div>
        <div className="flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3">
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            <CircleDollarSign size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Monthly rent</small>
            <strong>{money.format(monthlyRent)}</strong>
            <small className="truncate text-muted">expected</small>
          </span>
        </div>
      </section>

      <section className="flex items-center gap-2 rounded-md border border-default bg-surface p-3 max-lg:flex-wrap">
        <label className="flex h-9 w-[270px] items-center gap-2 rounded border border-default bg-subtle px-2.5 text-muted max-md:flex-1">
          <Search size={17} />
          <input
            className="min-w-0 flex-1 border-0 bg-transparent outline-none"
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            placeholder="Search property, code or landlord"
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
        <div className="flex h-9 items-center gap-1 rounded border border-default p-1">
          <button
            className={
              layout === "grid"
                ? "grid h-full w-7 place-items-center rounded-sm border-0 bg-hover text-primary"
                : "grid h-full w-7 place-items-center rounded-sm border-0 bg-transparent text-muted"
            }
            onClick={() => setLayout("grid")}
            aria-label="Grid view"
          >
            <Grid2X2 size={16} />
          </button>
          <button
            className={
              layout === "list"
                ? "grid h-full w-7 place-items-center rounded-sm border-0 bg-hover text-primary"
                : "grid h-full w-7 place-items-center rounded-sm border-0 bg-transparent text-muted"
            }
            onClick={() => setLayout("list")}
            aria-label="List view"
          >
            <List size={17} />
          </button>
        </div>
      </section>

      <div className="flex min-h-11 items-center justify-between text-secondary">
        <span>
          Showing {filtered.length} of {scopedProperties.length} properties
        </span>
        <div className="relative">
          <button
            className="flex items-center gap-1 border-0 bg-transparent text-secondary"
            onClick={() => setSortOpen((open) => !open)}
          >
            Sort: {SORT_OPTIONS.find((option) => option.id === sort)?.label}{" "}
            <ChevronDown size={14} />
          </button>
          {sortOpen ? (
            <div className="absolute right-0 top-8 z-20 w-[180px] rounded-md border border-default bg-surface p-1 shadow-lg">
              {SORT_OPTIONS.map((option) => (
                <button
                  className="flex w-full items-center justify-between rounded px-3 py-2 text-left hover:bg-sidebar"
                  key={option.id}
                  onClick={() => {
                    setSort(option.id);
                    setSortOpen(false);
                  }}
                >
                  <span>{option.label}</span>
                  {sort === option.id ? <Check size={14} className="text-primary" /> : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <section
        className={
          layout === "grid"
            ? "grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1"
            : "flex flex-col gap-2"
        }
      >
        {sorted.map((property) => {
          const occupancy = property.units
            ? Math.round((property.occupied / property.units) * 100)
            : 0;
          return (
            <article
              className={`${layout === "list" ? "grid grid-cols-[140px_1fr] max-sm:grid-cols-1" : ""} min-w-0 cursor-pointer overflow-hidden rounded-md border border-default bg-surface hover:shadow-lg`}
              key={property.id}
              onClick={() => openDetails(property, null)}
            >
              <div
                className={
                  property.accent === "forest"
                    ? "relative flex h-28 items-center justify-center overflow-hidden bg-primary text-inverse"
                    : property.accent === "gold"
                      ? "relative flex h-28 items-center justify-center overflow-hidden bg-warning text-inverse"
                      : property.accent === "brick"
                        ? "relative flex h-28 items-center justify-center overflow-hidden bg-danger text-inverse"
                        : property.accent === "blue"
                          ? "relative flex h-28 items-center justify-center overflow-hidden bg-info text-inverse"
                          : property.accent === "olive"
                            ? "relative flex h-28 items-center justify-center overflow-hidden bg-secondary text-inverse"
                            : "relative flex h-28 items-center justify-center overflow-hidden bg-sidebar text-inverse"
                }
              >
                <Building2 size={42} />
                <span className="absolute bottom-2.5 left-3 rounded-sm bg-canvas/40 px-2 py-1">
                  {property.type}
                </span>
                <button
                  className="absolute right-2 top-2 grid size-7 place-items-center rounded border-0 bg-canvas/40 text-inverse"
                  aria-label={`Options for ${property.name}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuFor(menuFor === property.id ? null : property.id);
                  }}
                >
                  <Ellipsis size={18} />
                </button>
                {menuFor === property.id ? (
                  <div
                    className="absolute right-2 top-10 z-10 w-[150px] rounded-md border border-default bg-surface p-1 text-primary shadow-lg"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      className="flex w-full rounded px-3 py-2 text-left hover:bg-sidebar"
                      onClick={() => {
                        openDetails(property, null);
                        setMenuFor(null);
                      }}
                    >
                      View details
                    </button>
                    {canCreate ? (
                      <button
                        className="flex w-full rounded px-3 py-2 text-left hover:bg-sidebar"
                        onClick={() => {
                          openDetails(property, "edit");
                          setMenuFor(null);
                        }}
                      >
                        Edit
                      </button>
                    ) : null}
                    {canCreate ? (
                      <button
                        className="flex w-full rounded px-3 py-2 text-left text-danger hover:bg-sidebar"
                        onClick={() => {
                          setMenuFor(null);
                          archiveFromMenu(property);
                        }}
                      >
                        Archive
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <small className="text-muted">{property.code}</small>
                    <h3 className="mt-0.5 font-semibold">{property.name}</h3>
                  </div>
                  <span className={statusBadgeClass(property.status)}>{property.status}</span>
                </div>
                <p className="my-3 flex items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap text-secondary">
                  <MapPin className="shrink-0" size={13} /> {property.address}
                </p>
                <div>
                  <div className="flex justify-between text-secondary">
                    <span>Occupancy</span>
                    <b className="text-primary">{occupancy}%</b>
                  </div>
                  <i className="mt-1 block h-1 overflow-hidden rounded bg-subtle">
                    <b
                      className="block h-full rounded bg-accent"
                      style={{ width: `${occupancy}%` }}
                    />
                  </i>
                </div>
                <div className="mt-3.5 grid grid-cols-[.6fr_1fr_1fr] gap-2 border-t border-default pt-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-muted">Units</span>
                    <b className="overflow-hidden text-ellipsis whitespace-nowrap text-primary">
                      {property.occupied} / {property.units}
                    </b>
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-muted">Monthly rent</span>
                    <b className="overflow-hidden text-ellipsis whitespace-nowrap text-primary">
                      {money.format(property.rent)}
                    </b>
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-muted">Landlord</span>
                    <b className="overflow-hidden text-ellipsis whitespace-nowrap text-primary">
                      {property.landlord}
                    </b>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {filtered.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-default text-muted">
          <Building2 size={30} />
          <strong>No properties found</strong>
          <span>Adjust your search or status filter.</span>
        </div>
      ) : null}

      <PropertyDetail
        key={selected ? selected.id : "none"}
        property={selected}
        initialAction={detailAction}
        landlords={landlords}
        onClose={() => {
          setSelected(null);
          setDetailAction(null);
        }}
      />
      {creating ? (
        <CreatePropertyDialog landlords={landlords} onClose={() => setCreating(false)} />
      ) : null}
    </main>
  );
}
