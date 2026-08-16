"use client";

import { useState, useDeferredValue } from "react";
import { Building2, ChevronRight, Download, Home, Plus, Search, Users, Wrench } from "lucide-react";
import UnitDetail from "./UnitDetail";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import { useSession } from "@/components/auth/SessionProvider";
import CreateUnitDialog from "./CreateUnitDialog";

export default function UnitsClient({ units, properties }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [property, setProperty] = useState("All properties");
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const { activeLandlord } = useWorkspace();
  const session = useSession();
  const canCreate = ["ADMIN", "MANAGER"].includes(session?.role);

  const deferredSearch = useDeferredValue(globalSearch);
  const scopedUnits = activeLandlord
    ? units.filter((unit) => unit.landlord === activeLandlord.name)
    : units;
  const filtered = scopedUnits.filter((unit) => {
    const matchesSearch = `${unit.number} ${unit.id} ${unit.property} ${unit.tenant || ""}`
      .toLowerCase()
      .includes(deferredSearch.toLowerCase());
    return (
      matchesSearch &&
      (status === "All" || unit.status === status) &&
      (property === "All properties" || unit.property === property)
    );
  });
  const occupiedCount = scopedUnits.filter((unit) => unit.status === "Occupied").length;
  const vacantCount = scopedUnits.filter((unit) => ["Vacant", "VACANT"].includes(unit.status)).length;
  const repairCount = scopedUnits.filter((unit) => ["Under Repair", "UNDER_REPAIR", "MAINTENANCE"].includes(unit.status)).length;

  return (
    <main className="px-8 py-6 max-md:px-4 max-md:py-5">
      <section className="mb-6 flex items-center justify-between gap-5">
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-accent">Portfolio / Units</p>
          <h2>Unit inventory</h2>
          <p>Track availability, rent, deposits and tenancy across every property.</p>
        </div>
        {canCreate ? <button onClick={() => setCreating(true)} className="flex h-10 items-center gap-2 rounded-md border border-primary bg-primary px-3 font-semibold text-inverse">
          <Plus size={17} /> Add unit
        </button> : null}
      </section>

      <section className="mb-3 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:gap-2">
        <button
          className={
            status === "All"
              ? "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-accent bg-hover p-3 text-left shadow-inner"
              : "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3 text-left hover:bg-hover"
          }
          onClick={() => setStatus("All")}
        >
          <span className="grid size-9 place-items-center rounded bg-subtle text-primary">
            <Home size={18} />
          </span>
          <span>
            <small>{activeLandlord ? "Landlord units" : "Total units"}</small>
            <strong>{scopedUnits.length}</strong>
          </span>
          <b>View all</b>
        </button>
        <button
          className={
            status === "Occupied"
              ? "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-accent bg-hover p-3 text-left shadow-inner"
              : "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3 text-left hover:bg-hover"
          }
          onClick={() => setStatus("Occupied")}
        >
          <span className="grid size-9 place-items-center rounded bg-subtle text-primary">
            <Users size={18} />
          </span>
          <span>
            <small>Occupied</small>
            <strong>{occupiedCount}</strong>
          </span>
          <b>{scopedUnits.length ? ((occupiedCount / scopedUnits.length) * 100).toFixed(1) : 0}%</b>
        </button>
        <button
          className={
            status === "Vacant"
              ? "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-accent bg-hover p-3 text-left shadow-inner"
              : "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3 text-left hover:bg-hover"
          }
          onClick={() => setStatus("Vacant")}
        >
          <span className="grid size-9 place-items-center rounded bg-subtle text-primary">
            <Building2 size={18} />
          </span>
          <span>
            <small>Vacant</small>
            <strong>{vacantCount}</strong>
          </span>
          <b>{scopedUnits.length ? ((vacantCount / scopedUnits.length) * 100).toFixed(1) : 0}%</b>
        </button>
        <button
          className={
            status === "Under Repair"
              ? "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-accent bg-hover p-3 text-left shadow-inner"
              : "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3 text-left hover:bg-hover"
          }
          onClick={() => setStatus("Under Repair")}
        >
          <span className="grid size-9 place-items-center rounded bg-subtle text-primary">
            <Wrench size={18} />
          </span>
          <span>
            <small>Under repair</small>
            <strong>{repairCount}</strong>
          </span>
          <b>{scopedUnits.length ? ((repairCount / scopedUnits.length) * 100).toFixed(1) : 0}%</b>
        </button>
      </section>

      <section className="overflow-hidden rounded-md border border-default bg-surface">
        <div className="flex items-center gap-2 border-b border-default p-3 max-lg:flex-wrap">
          <label className="flex h-9 w-[270px] items-center gap-2 rounded border border-default bg-subtle px-2.5 text-muted">
            <Search size={17} />
            <input
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search unit, property or tenant"
            />
          </label>
          <select
            value={property}
            onChange={(event) => setProperty(event.target.value)}
            aria-label="Filter by property"
          >
            <option>All properties</option>
            {properties.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option>All</option>
            <option>Occupied</option>
            <option>Vacant</option>
            <option>Reserved</option>
            <option>Under Repair</option>
          </select>
          <button className="ml-auto flex h-9 items-center gap-2 rounded border border-default bg-surface px-3 text-primary">
            <Download size={16} /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="bg-subtle p-3">Unit</th>
                <th className="bg-subtle p-3">Property</th>
                <th className="bg-subtle p-3">Type</th>
                <th className="bg-subtle p-3">Tenant</th>
                <th className="bg-subtle p-3">Monthly rent</th>
                <th className="bg-subtle p-3">Status</th>
                <th className="bg-subtle p-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((unit) => (
                <tr className="cursor-pointer" key={unit.id} onClick={() => setSelected(unit)}>
                  <td className="border-t border-default p-3">
                    <div className="flex items-center gap-2">
                      <span>{unit.number}</span>
                      <div>
                        <b>Unit {unit.number}</b>
                        <small>{unit.id}</small>
                      </div>
                    </div>
                  </td>
                  <td className="border-t border-default p-3">
                    <b>{unit.property}</b>
                    <small>{unit.floor}</small>
                  </td>
                  <td className="border-t border-default p-3">
                    <b>{unit.type}</b>
                    <small>
                      {unit.beds
                        ? `${unit.beds} bed · ${unit.baths} bath`
                        : `${unit.baths} washrooms`}
                    </small>
                  </td>
                  <td className="border-t border-default p-3">
                    {unit.tenant ? (
                      <>
                        <b>{unit.tenant}</b>
                        <small>{unit.lease}</small>
                      </>
                    ) : (
                      <span className="text-muted">Not assigned</span>
                    )}
                  </td>
                  <td className="border-t border-default p-3">
                    <b>${unit.rent.toLocaleString()}</b>
                    <small>Deposit ${unit.deposit.toLocaleString()}</small>
                  </td>
                  <td className="border-t border-default p-3">
                    <span
                      className={
                        unit.status === "Occupied"
                          ? "rounded-full bg-success-subtle px-2 py-1 font-bold text-success"
                          : unit.status === "Vacant"
                            ? "rounded-full bg-warning-subtle px-2 py-1 font-bold text-warning"
                            : unit.status === "Reserved"
                              ? "rounded-full bg-info-subtle px-2 py-1 font-bold text-info"
                              : "rounded-full bg-danger-subtle px-2 py-1 font-bold text-danger"
                      }
                    >
                      {unit.status}
                    </span>
                  </td>
                  <td className="border-t border-default p-3">
                    <ChevronRight size={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex min-h-12 items-center justify-between border-t border-default p-3 text-muted">
          <span>
            Showing {filtered.length} sample records from{" "}
            {activeLandlord ? activeLandlord.units : 312} units
          </span>
          <div className="flex gap-1">
            <button className="rounded border border-default p-2" disabled>
              Previous
            </button>
            <button className="rounded border border-primary bg-primary p-2 text-inverse">1</button>
            <button className="rounded border border-default p-2">2</button>
            <button className="rounded border border-default p-2">3</button>
            <button className="rounded border border-default p-2">Next</button>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-default text-muted">
          <Home size={30} />
          <strong>No units found</strong>
          <span>Adjust your property, status, or search filters.</span>
        </div>
      ) : null}

      <UnitDetail unit={selected} onClose={() => setSelected(null)} />
      {creating ? <CreateUnitDialog properties={properties} onClose={() => setCreating(false)} /> : null}
    </main>
  );
}
