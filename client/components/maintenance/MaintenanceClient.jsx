"use client";

import { useDeferredValue, useState } from "react";
import {
  Camera,
  ChevronDown,
  CircleAlert,
  ClipboardCheck,
  Columns3,
  List,
  Plus,
  Search,
  UserRound,
  Wrench,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import MaintenanceDetail from "./MaintenanceDetail";

const columns = ["Open", "Assigned", "In Progress", "Completed", "Verified"];
const summaryCardClass =
  "flex items-center gap-2.5 rounded-md border border-default bg-surface p-3.5";
const summaryIconClass = "grid h-[34px] w-[34px] place-items-center rounded bg-subtle text-primary";
const summaryBodyClass = "flex min-w-0 flex-col gap-0.5";
const listRowClass =
  "grid grid-cols-[8px_1.5fr_1fr_1fr_auto] items-center gap-3 border-t border-default bg-surface px-3 py-3 text-left";

export default function MaintenanceClient({ requests, properties, employees }) {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All priorities");
  const [property, setProperty] = useState("All properties");
  const [view, setView] = useState("board");
  const [selected, setSelected] = useState(null);
  const deferredSearch = useDeferredValue(search);
  const { activeLandlord } = useWorkspace();
  const scopedRequests = activeLandlord
    ? requests.filter((request) => request.landlord === activeLandlord.name)
    : requests;
  const scopedProperties = activeLandlord
    ? properties.filter((item) => item.landlord === activeLandlord.name)
    : properties;
  const filtered = scopedRequests.filter(
    (request) =>
      `${request.title} ${request.category} ${request.property} ${request.unit} ${request.tenant || ""}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()) &&
      (priority === "All priorities" || request.priority === priority) &&
      (property === "All properties" || request.property === property),
  );
  const openCount = scopedRequests.filter((item) =>
    ["Open", "Assigned", "In Progress"].includes(item.status),
  ).length;
  const urgentCount = scopedRequests.filter(
    (item) => item.priority === "High" && item.status !== "Verified",
  ).length;
  const totalCost = scopedRequests.reduce((sum, item) => sum + item.estimatedCost, 0);

  return (
    <main className="p-8 max-md:p-4">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:flex-col max-md:items-start">
        <div>
          <p className="section-kicker">Operations / Maintenance</p>
          <h1>
            {activeLandlord ? `${activeLandlord.name}'s maintenance` : "Maintenance operations"}
          </h1>
          <p>
            Assign requests, track repair progress, record costs, and preserve property history.
          </p>
        </div>
        <Button>
          <Plus size={15} /> New request
        </Button>
      </section>
      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <Wrench size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className="text-secondary">Active requests</small>
            <strong className="text-primary">{openCount}</strong>
            <b className="font-normal text-muted">Open through in progress</b>
          </div>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <CircleAlert size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className="text-secondary">High priority</small>
            <strong className="text-primary">{urgentCount}</strong>
            <b className="font-normal text-muted">Requires attention</b>
          </div>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <ClipboardCheck size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className="text-secondary">Completed</small>
            <strong className="text-primary">
              {
                scopedRequests.filter((item) => ["Completed", "Verified"].includes(item.status))
                  .length
              }
            </strong>
            <b className="font-normal text-muted">Awaiting or passed verification</b>
          </div>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <UserRound size={17} />
          </span>
          <div className={summaryBodyClass}>
            <small className="text-secondary">Estimated cost</small>
            <strong className="text-primary">${totalCost.toLocaleString()}</strong>
            <b className="font-normal text-muted">Across visible requests</b>
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-md border border-default bg-surface">
        <div className="flex items-center gap-2 border-b border-default p-3 max-md:flex-wrap">
          <label className="flex h-9 w-[300px] items-center gap-[7px] rounded border border-default bg-sidebar px-2.5 text-muted max-md:w-full">
            <Search size={16} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search request, category, property or tenant"
            />
          </label>
          <select
            className="h-9 min-w-[135px] rounded border border-default bg-surface px-2.5 text-primary outline-none"
            value={property}
            onChange={(event) => setProperty(event.target.value)}
          >
            <option>All properties</option>
            {scopedProperties.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
          <select
            className="h-9 min-w-[135px] rounded border border-default bg-surface px-2.5 text-primary outline-none"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option>All priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <button className="ml-auto flex h-[38px] items-center justify-center gap-[7px] rounded-md border border-default bg-surface px-[13px] font-semibold text-primary">
            Updated recently <ChevronDown size={14} />
          </button>
          <div className="flex h-9 gap-1 rounded border border-default p-[3px]">
            <button
              className={
                view === "board"
                  ? "grid w-7 place-items-center rounded border-0 bg-subtle text-primary"
                  : "grid w-7 place-items-center rounded border-0 bg-transparent text-secondary"
              }
              onClick={() => setView("board")}
              aria-label="Board view"
            >
              <Columns3 size={15} />
            </button>
            <button
              className={
                view === "list"
                  ? "grid w-7 place-items-center rounded border-0 bg-subtle text-primary"
                  : "grid w-7 place-items-center rounded border-0 bg-transparent text-secondary"
              }
              onClick={() => setView("list")}
              aria-label="List view"
            >
              <List size={15} />
            </button>
          </div>
        </div>
        {view === "board" ? (
          <div className="grid grid-cols-[repeat(5,minmax(190px,1fr))] gap-2 overflow-x-auto bg-subtle p-2.5">
            {columns.map((column) => (
              <div className="min-h-[430px]" key={column}>
                <div className="flex h-8 items-center justify-between px-1 text-secondary">
                  <span>{column}</span>
                  <b className="min-w-5 rounded-full bg-hover px-1.5 py-0.5 text-center text-primary">
                    {filtered.filter((item) => item.status === column).length}
                  </b>
                </div>
                <div>
                  {filtered
                    .filter((item) => item.status === column)
                    .map((request) => (
                      <button
                        className="w-full rounded border border-default bg-surface p-2.5 text-left hover:bg-hover"
                        key={request.id}
                        onClick={() => setSelected(request)}
                      >
                        <div>
                          <span
                            className={
                              request.priority === "High"
                                ? "inline-block h-1.5 w-1.5 rounded-full bg-danger"
                                : request.priority === "Medium"
                                  ? "inline-block h-1.5 w-1.5 rounded-full bg-warning"
                                  : "inline-block h-1.5 w-1.5 rounded-full bg-muted"
                            }
                          />{" "}
                          <small>
                            {request.priority} · {request.category}
                          </small>
                          <b>{request.id}</b>
                        </div>
                        <strong>{request.title}</strong>
                        <p>
                          {request.property} · Unit {request.unit}
                        </p>
                        <div>
                          <span>
                            <UserRound size={12} />
                            {request.assignee || "Unassigned"}
                          </span>
                          <span>
                            <Camera size={12} />
                            {request.photos}
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {filtered.map((request) => (
              <button
                className={listRowClass}
                key={request.id}
                onClick={() => setSelected(request)}
              >
                <span
                  className={
                    request.priority === "High"
                      ? "h-1.5 w-1.5 rounded-full bg-danger"
                      : request.priority === "Medium"
                        ? "h-1.5 w-1.5 rounded-full bg-warning"
                        : "h-1.5 w-1.5 rounded-full bg-muted"
                  }
                />
                <span>
                  <strong className="text-primary">{request.title}</strong>
                  <small className="block text-muted">
                    {request.id} · {request.category}
                  </small>
                </span>
                <span>
                  <strong className="text-primary">{request.property}</strong>
                  <small className="block text-muted">
                    Unit {request.unit} · {request.landlord}
                  </small>
                </span>
                <span>
                  <strong className="text-primary">{request.assignee || "Unassigned"}</strong>
                  <small className="block text-muted">
                    ${request.estimatedCost.toLocaleString()} estimated
                  </small>
                </span>
                <span
                  className={
                    request.status === "Completed" || request.status === "Verified"
                      ? "rounded bg-success-subtle px-2 py-1 font-bold text-success"
                      : request.status === "In Progress"
                        ? "rounded bg-warning-subtle px-2 py-1 font-bold text-warning"
                        : request.status === "Assigned"
                          ? "rounded bg-info-subtle px-2 py-1 font-bold text-info"
                          : "rounded bg-subtle px-2 py-1 font-bold text-secondary"
                  }
                >
                  {request.status}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
      <MaintenanceDetail
        request={selected}
        employees={employees}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}
