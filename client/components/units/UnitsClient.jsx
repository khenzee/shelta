"use client";

import { useDeferredValue, useState } from "react";
import {
  Building2,
  ChevronRight,
  DoorOpen,
  Download,
  Home,
  Plus,
  Search,
  Users,
  Wrench,
} from "lucide-react";
import UnitDetail from "./UnitDetail";
import CreateUnitDialog from "./CreateUnitDialog";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import { useSession } from "@/components/auth/SessionProvider";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const STATUS_TABS = ["All", "Occupied", "Vacant", "Reserved", "Under Repair"];

const statCardClass = (active) =>
  active
    ? "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-accent bg-hover p-3 text-left shadow-inner"
    : "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3 text-left hover:bg-hover";

const statusPillClass = (status) =>
  status === "Occupied"
    ? "rounded-full bg-success-subtle px-2 py-1 font-bold text-success"
    : status === "Vacant"
      ? "rounded-full bg-warning-subtle px-2 py-1 font-bold text-warning"
      : status === "Reserved"
        ? "rounded-full bg-info-subtle px-2 py-1 font-bold text-info"
        : "rounded-full bg-danger-subtle px-2 py-1 font-bold text-danger";

const tableHeaderClass = "h-[37px] bg-sidebar px-3 text-left font-semibold uppercase text-muted";
const tableCellClass = "border-t border-default px-3 py-3 align-middle text-secondary";

export default function UnitsClient({ units, properties }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [property, setProperty] = useState("All properties");
  const [selected, setSelected] = useState(null);
  const [detailAction, setDetailAction] = useState(null);
  const [creating, setCreating] = useState(false);
  const deferredSearch = useDeferredValue(globalSearch);
  const { activeLandlord } = useWorkspace();
  const session = useSession();
  const canCreate = ["ADMIN", "MANAGER"].includes(session?.role);

  const scopedUnits = activeLandlord
    ? units.filter(
        (unit) => unit.landlordId === activeLandlord.id || unit.landlord === activeLandlord.name,
      )
    : units;
  const scopedProperties = activeLandlord
    ? properties.filter(
        (item) => item.landlordId === activeLandlord.id || item.landlord === activeLandlord.name,
      )
    : properties;

  const filtered = scopedUnits.filter((unit) => {
    const matchesSearch = `${unit.code} ${unit.property} ${unit.type} ${unit.tenant || ""}`
      .toLowerCase()
      .includes(deferredSearch.toLowerCase());
    return (
      matchesSearch &&
      (status === "All" || unit.status === status) &&
      (property === "All properties" || unit.property === property)
    );
  });

  const occupiedCount = scopedUnits.filter((unit) => unit.status === "Occupied").length;
  const vacantCount = scopedUnits.filter((unit) => unit.status === "Vacant").length;
  const repairCount = scopedUnits.filter((unit) => unit.status === "Under Repair").length;
  const totalRent = scopedUnits.reduce((sum, unit) => sum + Number(unit.rent || 0), 0);

  function openDetails(unit, action) {
    setDetailAction(action || null);
    setSelected(unit);
  }

  function exportCsv() {
    const rows = [
      [
        "Unit",
        "Property",
        "Type",
        "Bedrooms",
        "Bathrooms",
        "Tenant",
        "Monthly rent",
        "Deposit",
        "Status",
      ],
      ...filtered.map((unit) => [
        unit.code,
        unit.property,
        unit.type,
        unit.bedrooms,
        unit.bathrooms,
        unit.tenant || "",
        unit.rent,
        unit.deposit,
        unit.status,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `shelta-units-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="px-8 py-6 max-md:px-4 max-md:pb-8 max-md:pt-5">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:items-start">
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-accent">Inventory / Units</p>
          <h1 className="mb-1 font-medium">Unit inventory</h1>
          <p className="m-0 text-muted">
            Track availability, rent, deposits and tenancy across every property.
          </p>
        </div>
        {canCreate ? (
          <button
            onClick={() => setCreating(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-3 font-semibold text-inverse"
          >
            <Plus size={17} /> Add unit
          </button>
        ) : null}
      </section>

      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <button className={statCardClass(status === "All")} onClick={() => setStatus("All")}>
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            <Home size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">
              {activeLandlord ? "Landlord units" : "Total units"}
            </small>
            <strong>{scopedUnits.length}</strong>
            <small className="truncate text-muted">{money.format(totalRent)} monthly rent</small>
          </span>
        </button>
        <button
          className={statCardClass(status === "Occupied")}
          onClick={() => setStatus("Occupied")}
        >
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            <Users size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Occupied</small>
            <strong>{occupiedCount}</strong>
            <small className="truncate text-muted">
              {scopedUnits.length ? ((occupiedCount / scopedUnits.length) * 100).toFixed(1) : 0}% of
              units
            </small>
          </span>
        </button>
        <button className={statCardClass(status === "Vacant")} onClick={() => setStatus("Vacant")}>
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            <Building2 size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Vacant</small>
            <strong>{vacantCount}</strong>
            <small className="truncate text-muted">
              {money.format(
                scopedUnits
                  .filter((unit) => unit.status === "Vacant")
                  .reduce((sum, unit) => sum + Number(unit.rent || 0), 0),
              )}{" "}
              at risk
            </small>
          </span>
        </button>
        <button
          className={statCardClass(status === "Under Repair")}
          onClick={() => setStatus("Under Repair")}
        >
          <span className="grid size-9 flex-none place-items-center rounded bg-subtle text-primary">
            <Wrench size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Under repair</small>
            <strong>{repairCount}</strong>
            <small className="truncate text-muted">Currently unavailable</small>
          </span>
        </button>
      </section>

      <section className="overflow-hidden rounded-md border border-default bg-surface">
        <div className="flex items-center gap-2 border-b border-default p-3 max-lg:flex-wrap">
          <label className="flex h-9 w-[280px] items-center gap-2 rounded border border-default bg-subtle px-2.5 text-muted max-md:flex-1">
            <Search size={17} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-primary outline-none"
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search unit, property or tenant"
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
          <select
            className="h-9 rounded border border-default bg-surface px-3 text-secondary outline-none"
            value={property}
            onChange={(event) => setProperty(event.target.value)}
            aria-label="Filter by property"
          >
            <option>All properties</option>
            {scopedProperties.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
          <button
            className="flex h-9 items-center gap-2 rounded border border-default bg-surface px-3 font-semibold text-primary"
            onClick={exportCsv}
          >
            <Download size={16} /> Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr>
                <th className={tableHeaderClass}>Unit</th>
                <th className={tableHeaderClass}>Property</th>
                <th className={tableHeaderClass}>Type</th>
                <th className={tableHeaderClass}>Tenant</th>
                <th className={tableHeaderClass}>Monthly rent</th>
                <th className={tableHeaderClass}>Status</th>
                <th className={tableHeaderClass} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((unit) => (
                <tr
                  className="cursor-pointer hover:bg-hover"
                  key={unit.id}
                  onClick={() => openDetails(unit, null)}
                >
                  <td className={tableCellClass}>
                    <b className="block text-primary">{unit.code}</b>
                    <small className="text-muted">{unit.landlord || "—"}</small>
                  </td>
                  <td className={tableCellClass}>
                    <b className="block max-w-[220px] truncate text-primary">{unit.property}</b>
                    {unit.floor ? <small className="text-muted">Floor {unit.floor}</small> : null}
                  </td>
                  <td className={tableCellClass}>
                    <b className="block text-primary">{unit.type}</b>
                    <small className="text-muted">
                      {unit.bedrooms} bed · {unit.bathrooms} bath
                    </small>
                  </td>
                  <td className={tableCellClass}>
                    {unit.tenant ? (
                      <b className="block text-primary">{unit.tenant}</b>
                    ) : (
                      <span className="text-muted">Not assigned</span>
                    )}
                  </td>
                  <td className={tableCellClass}>
                    <b className="block text-primary">{money.format(unit.rent)}</b>
                    <small className="text-muted">Deposit {money.format(unit.deposit)}</small>
                  </td>
                  <td className={tableCellClass}>
                    <span className={statusPillClass(unit.status)}>{unit.status}</span>
                  </td>
                  <td className={tableCellClass}>
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td className="border-t border-default p-10 text-center text-muted" colSpan={7}>
                    <DoorOpen className="mx-auto mb-2" size={30} />
                    <b className="block text-secondary">No units found</b>
                    Adjust your property, status, or search filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex min-h-12 items-center justify-between border-t border-default px-3 text-muted">
          <span>
            Showing {filtered.length} of {scopedUnits.length} units
          </span>
        </div>
      </section>

      <UnitDetail
        key={selected ? selected.id : "none"}
        unit={selected}
        initialAction={detailAction}
        onClose={() => {
          setSelected(null);
          setDetailAction(null);
        }}
      />
      {creating ? (
        <CreateUnitDialog properties={properties} onClose={() => setCreating(false)} />
      ) : null}
    </main>
  );
}
