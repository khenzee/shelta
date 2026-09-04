"use client";

import { Building2, Search, X } from "lucide-react";
import { useDeferredValue, useState } from "react";
import { useWorkspace } from "./WorkspaceProvider";
import NotificationsBell from "./NotificationsBell";

export default function WorkspaceTabs() {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const { landlords, openLandlords, activeLandlordId, openLandlord, closeLandlord, showAgency } =
    useWorkspace();
  const results = landlords.filter((landlord) =>
    `${landlord.name} ${landlord.email}`.toLowerCase().includes(deferredSearch.toLowerCase()),
  );

  return (
    <div className="flex h-10.5 items-center justify-between gap-3 border-b border-default bg-surface px-4 md:px-8">
      <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
        <button
          className={`flex h-7.25 items-center gap-1 whitespace-nowrap rounded px-2 text-secondary ${!activeLandlordId ? "bg-subtle text-primary" : ""}`}
          onClick={showAgency}
        >
          <Building2 size={14} />
          <span>Agency overview</span>
        </button>
        {openLandlords.map((landlord) => (
          <div
            className={`flex items-center rounded ${activeLandlordId === landlord.id ? "bg-subtle text-primary" : "text-secondary"}`}
            key={landlord.id}
          >
            <button
              className="flex h-[29px] items-center gap-1 whitespace-nowrap border-0 bg-transparent px-2"
              onClick={() => openLandlord(landlord.id)}
            >
              <span className="grid size-[18px] place-items-center rounded bg-secondary font-bold text-inverse">
                {landlord.initials}
              </span>
              <span>{landlord.name}</span>
            </button>
            <button
              className="grid h-[29px] place-items-center border-0 bg-transparent px-1"
              onClick={() => closeLandlord(landlord.id)}
              aria-label={`Close ${landlord.name}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
      <div className="relative flex items-center gap-1">
        <button
          className="flex h-[29px] items-center gap-1 whitespace-nowrap rounded border-0 bg-transparent px-2 text-secondary"
          onClick={() => setSearchOpen((current) => !current)}
        >
          <Search size={15} />
          <span className="hidden md:inline">Open landlord</span>
        </button>
        <NotificationsBell />
        {searchOpen ? (
          <div className="absolute right-0 top-9 z-30 w-[310px] rounded-md border border-default bg-surface p-2 shadow-lg">
            <label className="flex items-center gap-2 border border-default p-2 text-muted">
              <Search size={14} />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent outline-none text-primary"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search landlords..."
                autoFocus
              />
            </label>
            <p className="mb-1 mt-3 px-2 text-muted">Landlords</p>
            {results.length ? (
              results.map((landlord) => (
                <button
                  className="flex w-full items-center gap-2 rounded border-0 bg-surface p-2 text-left hover:bg-sidebar"
                  key={landlord.id}
                  onClick={() => {
                    openLandlord(landlord.id);
                    setSearchOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="grid size-[18px] place-items-center rounded bg-secondary font-bold text-inverse">
                    {landlord.initials}
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <b className="text-primary">{landlord.name}</b>
                    <small className="truncate text-muted">
                      {landlord.properties} properties · {landlord.email}
                    </small>
                  </span>
                </button>
              ))
            ) : (
              <p className="px-2 py-3 text-sm text-muted">No landlords found</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
