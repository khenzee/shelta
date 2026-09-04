"use client";

import { useDeferredValue, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Columns3,
  Download,
  List,
  Plus,
  Search,
  UserRound,
  Wrench,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { useWorkspace } from "@/components/layout/WorkspaceProvider";
import { useSession } from "@/components/auth/SessionProvider";
import MaintenanceDetail from "./MaintenanceDetail";
import CreateMaintenanceDialog from "./CreateMaintenanceDialog";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const WORKFLOW = [
  { code: "OPEN", label: "Open" },
  { code: "ASSIGNED", label: "Assigned" },
  { code: "IN_PROGRESS", label: "In Progress" },
  { code: "COMPLETED", label: "Completed" },
  { code: "VERIFIED", label: "Verified" },
];

const PRIORITY_TABS = ["All priorities", "Urgent", "High", "Medium", "Low"];

const priorityDot = (priority) =>
  priority === "Urgent"
    ? "inline-block size-1.5 rounded-full bg-danger"
    : priority === "High"
      ? "inline-block size-1.5 rounded-full bg-danger"
      : priority === "Medium"
        ? "inline-block size-1.5 rounded-full bg-warning"
        : "inline-block size-1.5 rounded-full bg-muted";

const statusPillClass = (status) =>
  status === "Verified"
    ? "rounded bg-success-subtle px-2 py-1 font-bold text-success"
    : status === "Completed"
      ? "rounded bg-success-subtle px-2 py-1 font-bold text-success"
      : status === "In Progress"
        ? "rounded bg-warning-subtle px-2 py-1 font-bold text-warning"
        : status === "Assigned"
          ? "rounded bg-info-subtle px-2 py-1 font-bold text-info"
          : "rounded bg-subtle px-2 py-1 font-bold text-secondary";

const summaryCardClass =
  "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3";
const summaryIconClass = "grid size-9 flex-none place-items-center rounded bg-subtle text-primary";

const listRowClass =
  "grid w-full grid-cols-[8px_minmax(200px,1.5fr)_minmax(160px,1fr)_minmax(150px,1fr)_110px_110px] items-center gap-3 border-0 border-t border-default bg-surface px-3 py-3 text-left hover:bg-hover max-md:min-w-[860px]";

export default function MaintenanceClient({
  requests,
  properties,
  employees,
  tenants = [],
  units = [],
}) {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All priorities");
  const [property, setProperty] = useState("All properties");
  const [view, setView] = useState("board");
  const [selected, setSelected] = useState(null);
  const [detailAction, setDetailAction] = useState(null);
  const [creating, setCreating] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const { activeLandlord } = useWorkspace();
  const session = useSession();
  const canManage = ["ADMIN", "MANAGER"].includes(session?.role);

  const scopedRequests = activeLandlord
    ? requests.filter((request) => request.landlordId === activeLandlord.id)
    : requests;
  const scopedProperties = activeLandlord
    ? properties.filter(
        (item) => item.landlordId === activeLandlord.id || item.landlord === activeLandlord.name,
      )
    : properties;

  const filtered = scopedRequests.filter(
    (request) =>
      `${request.title} ${request.category} ${request.property} ${request.unit} ${request.tenant || ""} ${request.assignee || ""}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()) &&
      (priority === "All priorities" || request.priority === priority) &&
      (property === "All properties" || request.property === property),
  );

  const openCount = scopedRequests.filter((item) =>
    ["Open", "Assigned", "In Progress"].includes(item.status),
  ).length;
  const urgentCount = scopedRequests.filter((item) =>
    ["Urgent", "High"].includes(item.priority),
  ).length;
  const completedCount = scopedRequests.filter((item) =>
    ["Completed", "Verified"].includes(item.status),
  ).length;
  const totalCost = scopedRequests.reduce((sum, item) => sum + item.estimatedCost, 0);
  const unassignedCount = scopedRequests.filter(
    (item) => !item.assigneeId && item.status !== "Verified",
  ).length;

  function openDetails(request, action) {
    setDetailAction(action || null);
    setSelected(request);
  }

  function exportCsv() {
    const rows = [
      [
        "Title",
        "Category",
        "Priority",
        "Status",
        "Property",
        "Unit",
        "Tenant",
        "Assignee",
        "Estimated cost",
        "Actual cost",
      ],
      ...filtered.map((item) => [
        item.title,
        item.category,
        item.priority,
        item.status,
        item.property,
        item.unit,
        item.tenant,
        item.assignee || "Unassigned",
        item.estimatedCost,
        item.actualCost,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `shelta-maintenance-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="px-8 py-6 max-md:px-4 max-md:pb-8 max-md:pt-5">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:items-start">
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-accent">
            Operations / Maintenance
          </p>
          <h1 className="mb-1 font-medium">
            {activeLandlord ? `${activeLandlord.name}'s maintenance` : "Maintenance operations"}
          </h1>
          <p className="m-0 text-muted">Assign requests, track repair progress and record costs.</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus size={15} /> New request
        </Button>
      </section>

      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <Wrench size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Active requests</small>
            <strong>{openCount}</strong>
            <small className="truncate text-muted">Open through in progress</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            {urgentCount > 0 ? <CircleAlert size={18} /> : <ClipboardCheck size={18} />}
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Urgent / High</small>
            <strong>{urgentCount}</strong>
            <small className="truncate text-muted">Requires attention</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <UserRound size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Unassigned</small>
            <strong>{unassignedCount}</strong>
            <small className="truncate text-muted">Waiting for a team member</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <ClipboardCheck size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Estimated cost</small>
            <strong>{money.format(totalCost)}</strong>
            <small className="truncate text-muted">{completedCount} completed or verified</small>
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-default bg-surface">
        <div className="flex items-center gap-2 border-b border-default p-3 max-md:flex-wrap">
          <label className="flex h-9 w-[260px] items-center gap-2 rounded border border-default bg-subtle px-2.5 text-muted max-md:flex-1">
            <Search size={16} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-primary outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search request, property, tenant or assignee"
            />
          </label>
          <div className="flex flex-1 items-center gap-1 overflow-x-auto max-md:order-3 max-md:basis-full">
            {PRIORITY_TABS.map((item) => (
              <button
                className={
                  priority === item
                    ? "h-8 whitespace-nowrap rounded border-0 bg-hover px-2.5 font-bold text-primary"
                    : "h-8 whitespace-nowrap rounded border-0 bg-transparent px-2.5 text-secondary hover:bg-hover"
                }
                onClick={() => setPriority(item)}
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
          <Button variant="secondary" onClick={exportCsv}>
            <Download size={14} /> Export
          </Button>
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
          <div className="grid grid-cols-[repeat(5,minmax(200px,1fr))] gap-2 overflow-x-auto bg-subtle p-2.5">
            {WORKFLOW.map((column, columnIndex) => {
              const columnRequests = filtered.filter((item) => item.status === column.label);
              return (
                <div className="flex min-h-[440px] flex-col" key={column.code}>
                  <div className="mb-2 flex h-8 items-center justify-between rounded bg-surface px-2 text-secondary">
                    <span className="font-semibold">{column.label}</span>
                    <b className="min-w-5 rounded-full bg-hover px-1.5 py-0.5 text-center text-primary">
                      {columnRequests.length}
                    </b>
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    {columnRequests.map((request) => (
                      <button
                        className="w-full rounded border border-default bg-surface p-2.5 text-left transition-shadow hover:shadow-md"
                        key={request.id}
                        onClick={() => openDetails(request, null)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <small className="flex items-center gap-1.5 text-muted">
                            <span className={priorityDot(request.priority)} />
                            {request.priority} · {request.category}
                          </small>
                          {canManage && columnIndex > 0 && columnIndex < 4 ? (
                            <span
                              className="rounded bg-hover px-1 py-0.5 text-muted"
                              title="Use details to move status"
                            >
                              <ChevronLeft size={12} />
                            </span>
                          ) : null}
                        </div>
                        <strong className="mt-1.5 block text-primary">{request.title}</strong>
                        <p className="m-0 mt-1 truncate text-muted">
                          {request.property}
                          {request.unit !== "Unassigned" ? ` · Unit ${request.unit}` : ""}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-default pt-2 text-muted">
                          <span className="flex min-w-0 items-center gap-1">
                            <UserRound size={12} className="flex-none" />
                            <span className="truncate">{request.assignee || "Unassigned"}</span>
                          </span>
                          {request.estimatedCost > 0 ? (
                            <b className="flex-none text-primary">
                              {money.format(request.estimatedCost)}
                            </b>
                          ) : null}
                        </div>
                      </button>
                    ))}
                    {columnRequests.length === 0 ? (
                      <p className="m-0 rounded border border-dashed border-default p-3 text-center text-muted">
                        Nothing here
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {filtered.map((request) => (
              <button
                className={listRowClass}
                key={request.id}
                onClick={() => openDetails(request, null)}
              >
                <span className={priorityDot(request.priority)} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <strong className="truncate text-primary">{request.title}</strong>
                  <small className="truncate text-muted">
                    {request.category} · {request.priority}
                  </small>
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <strong className="truncate text-primary">{request.property}</strong>
                  <small className="truncate text-muted">
                    Unit {request.unit} · {request.landlord}
                  </small>
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <strong className="truncate text-primary">
                    {request.assignee || "Unassigned"}
                  </strong>
                  <small className="truncate text-muted">
                    {request.tenant || "Agency operations"}
                  </small>
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <strong className="text-primary">
                    {request.estimatedCost > 0 ? money.format(request.estimatedCost) : "—"}
                  </strong>
                  <small className="text-muted">Estimated</small>
                </span>
                <span className={statusPillClass(request.status)}>{request.status}</span>
              </button>
            ))}
            {filtered.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-muted">
                <Wrench size={30} />
                <strong>No requests found</strong>
                <span>Adjust the search or filters.</span>
              </div>
            ) : null}
          </div>
        )}
        <div className="flex min-h-12 items-center justify-between border-t border-default px-3 text-muted">
          <span>
            Showing {filtered.length} of {scopedRequests.length} requests
          </span>
        </div>
      </section>

      <MaintenanceDetail
        key={selected ? selected.id : "none"}
        request={selected}
        initialAction={detailAction}
        employees={employees}
        onClose={() => {
          setSelected(null);
          setDetailAction(null);
        }}
      />
      {creating ? (
        <CreateMaintenanceDialog
          properties={properties}
          units={units}
          tenants={tenants}
          onClose={() => setCreating(false)}
        />
      ) : null}
    </main>
  );
}
