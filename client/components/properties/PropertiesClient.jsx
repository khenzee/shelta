"use client";

import { useState, useDeferredValue } from "react";
import {
  Building2,
  ChevronDown,
  Filter,
  Grid2X2,
  List,
  MapPin,
  Plus,
  Search,
  Ellipsis,
} from "lucide-react";
import PropertyDetail from "./PropertyDetail";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";

export default function PropertiesClient({ properties }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [layout, setLayout] = useState("grid");
  const [selected, setSelected] = useState(null);
  const { activeLandlord } = useWorkspace();

  const deferredSearch = useDeferredValue(globalSearch);
  const scopedProperties = activeLandlord
    ? properties.filter((property) => property.landlord === activeLandlord.name)
    : properties;
  const filtered = scopedProperties.filter((property) => {
    const matchesSearch = `${property.name} ${property.address} ${property.landlord} ${property.id}`
      .toLowerCase()
      .includes(deferredSearch.toLowerCase());
    return matchesSearch && (status === "All" || property.status === status);
  });

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
        <button className="flex h-10 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-3 font-semibold text-inverse">
          <Plus size={17} /> Add property
        </button>
      </section>

      <section className="mb-3.5 grid grid-cols-4 rounded-md border border-default bg-surface max-lg:grid-cols-2">
        <div className="grid grid-cols-[auto_1fr] items-end gap-x-2 border-r border-default p-4">
          <span className="col-span-full text-secondary">
            {activeLandlord ? "Landlord portfolio" : "Total portfolio"}
          </span>
          <strong>{activeLandlord ? activeLandlord.properties : 24}</strong>
          <small className="text-muted">properties</small>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-end gap-x-2 border-r border-default p-4">
          <span className="col-span-full text-secondary">Total units</span>
          <strong>312</strong>
          <small className="text-muted">across 5 cities</small>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-end gap-x-2 border-r border-default p-4 max-md:border-t">
          <span className="col-span-full text-secondary">Occupied</span>
          <strong>289</strong>
          <small className="text-muted">92.6% occupancy</small>
        </div>
        <div className="grid grid-cols-[auto_1fr] items-end gap-x-2 p-4 max-md:border-t">
          <span className="col-span-full text-secondary">Monthly rent</span>
          <strong>$482.1k</strong>
          <small className="text-muted">expected</small>
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
          {["All", "Active", "Under Maintenance"].map((item) => (
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
        <button className="flex h-10 items-center justify-center gap-2 rounded-md border border-default bg-surface px-3 font-semibold text-primary max-sm:size-9 max-sm:px-0">
          <Filter size={16} /> <span className="max-sm:hidden">Filters</span>
        </button>
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
        <button className="flex items-center gap-1 border-0 bg-transparent text-secondary">
          Sort: Recently updated <ChevronDown size={14} />
        </button>
      </div>

      <section
        className={
          layout === "grid"
            ? "grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1"
            : "flex flex-col gap-2"
        }
      >
        {filtered.map((property) => {
          const occupancy = Math.round((property.occupied / property.units) * 100);
          return (
            <article
              className={`${layout === "list" ? "grid grid-cols-[140px_1fr] max-sm:grid-cols-1" : ""} min-w-0 cursor-pointer overflow-hidden rounded-md border border-default bg-surface hover:shadow-lg`}
              key={property.id}
              onClick={() => setSelected(property)}
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
                  onClick={(event) => event.stopPropagation()}
                >
                  <Ellipsis size={18} />
                </button>
              </div>
              <div className="p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <small className="text-muted">{property.id}</small>
                    <h3 className="mt-0.5 font-semibold">{property.name}</h3>
                  </div>
                  <span
                    className={
                      property.status === "Active"
                        ? "shrink-0 rounded bg-success-subtle px-2 py-1 font-bold text-success"
                        : "shrink-0 rounded bg-warning-subtle px-2 py-1 font-bold text-warning"
                    }
                  >
                    {property.status}
                  </span>
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
                      {property.rent}
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

      <PropertyDetail property={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
