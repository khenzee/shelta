"use client";

import { useDeferredValue, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserRoundCog,
  Users,
} from "lucide-react";
import Button from "@/components/ui/Button";
import EmployeeDetail from "./EmployeeDetail";
import InviteEmployeeDialog from "./InviteEmployeeDialog";

const summaryCardClass =
  "flex h-20 min-w-0 items-center gap-2.5 rounded-md border border-default bg-surface p-3";
const summaryIconClass = "grid size-9 flex-none place-items-center rounded bg-subtle text-primary";

const STATUS_TABS = ["All statuses", "Active", "Invited", "Suspended"];

const tableHeaderClass = "h-[37px] bg-sidebar px-3 text-left font-semibold uppercase text-muted";
const tableCellClass = "border-t border-default px-3 py-3 text-secondary";

const statusPillClass = (status) =>
  status === "Active"
    ? "inline-flex rounded bg-success-subtle px-2 py-1 font-bold text-success"
    : status === "Invited"
      ? "inline-flex rounded bg-warning-subtle px-2 py-1 font-bold text-warning"
      : "inline-flex rounded bg-danger-subtle px-2 py-1 font-bold text-danger";

const ROLE_LABELS = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  AGENT: "Agent",
};

export default function TeamClient({ employees, roles = [], properties = [] }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All roles");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [sort, setSort] = useState("active");
  const [sortOpen, setSortOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const safeEmployees = employees || [];

  const roleOptions = [
    ...new Map(
      safeEmployees
        .map((employee) => ({ id: employee.role, label: employee.role }))
        .concat(
          roles.map((item) => ({ id: item.name, label: ROLE_LABELS[item.name] || item.name })),
        )
        .map((item) => [item.id, item]),
    ).values(),
  ];

  const filtered = safeEmployees
    .filter(
      (employee) =>
        `${employee.name} ${employee.email} ${employee.department} ${employee.role}`
          .toLowerCase()
          .includes(deferredSearch.toLowerCase()) &&
        (role === "All roles" || employee.role === role) &&
        (status === "All statuses" || employee.status === status),
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      const aTime = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
      const bTime = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
      return bTime - aTime;
    });

  const activeCount = safeEmployees.filter((employee) => employee.status === "Active").length;
  const pendingCount = safeEmployees.filter((employee) => employee.status !== "Active").length;
  const roleNames = roles.map((item) => ROLE_LABELS[item.name] || item.name);

  return (
    <main className="px-8 py-6 max-md:px-4 max-md:pb-8 max-md:pt-5">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:items-start">
        <div>
          <p className="mb-2 font-bold uppercase tracking-wider text-accent">
            Administration / Team
          </p>
          <h1 className="mb-1 font-medium">Team and permissions</h1>
          <p className="m-0 text-muted">
            Control who can access landlord portfolios, finances, documents and operations.
          </p>
        </div>
        <Button onClick={() => setInviting(true)}>
          <Plus size={16} /> Invite team member
        </Button>
      </section>

      <section className="mb-3.5 grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <Users size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Team members</small>
            <strong>{safeEmployees.length}</strong>
            <small className="truncate text-muted">{activeCount} active accounts</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <ShieldCheck size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Roles configured</small>
            <strong>{roles.length}</strong>
            <small className="truncate text-muted">{roleNames.join(", ") || "—"}</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <UserCheck size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Active now</small>
            <strong>{activeCount}</strong>
            <small className="truncate text-muted">Signed in at least once</small>
          </span>
        </div>
        <div className={summaryCardClass}>
          <span className={summaryIconClass}>
            <UserRoundCog size={18} />
          </span>
          <span className="flex min-w-0 flex-col">
            <small className="text-secondary">Pending action</small>
            <strong>{pendingCount}</strong>
            <small className="truncate text-muted">Invited or suspended</small>
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-md border border-default bg-surface">
        <div className="flex items-center gap-2 border-b border-default p-3 max-md:flex-wrap">
          <label className="flex h-9 w-[280px] items-center gap-2 rounded border border-default bg-subtle px-2.5 text-muted max-md:flex-1">
            <Search size={17} />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-primary outline-none"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, role or department"
            />
          </label>
          <div className="flex flex-1 items-center gap-1 overflow-x-auto max-md:order-3 max-md:basis-full">
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
            value={role}
            onChange={(event) => setRole(event.target.value)}
            aria-label="Filter role"
          >
            <option>All roles</option>
            {roleOptions.map((item) => (
              <option key={item.id}>{item.label}</option>
            ))}
          </select>
          <div className="relative">
            <button
              className="flex h-9 items-center gap-1 rounded border border-default bg-surface px-3 text-secondary"
              onClick={() => setSortOpen((open) => !open)}
            >
              Sort: {sort === "active" ? "Last active" : "Name A-Z"} <ChevronDown size={14} />
            </button>
            {sortOpen ? (
              <div className="absolute right-0 top-10 z-20 w-[160px] rounded-md border border-default bg-surface p-1 shadow-lg">
                {[
                  { id: "active", label: "Last active" },
                  { id: "name", label: "Name A-Z" },
                ].map((option) => (
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr>
                <th className={tableHeaderClass}>Team member</th>
                <th className={tableHeaderClass}>Role</th>
                <th className={tableHeaderClass}>Assigned properties</th>
                <th className={tableHeaderClass}>Status</th>
                <th className={tableHeaderClass}>Last active</th>
                <th className={tableHeaderClass} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((employee) => (
                <tr
                  key={employee.id}
                  onClick={() => setSelected(employee)}
                  className="cursor-pointer hover:bg-hover"
                >
                  <td className={tableCellClass}>
                    <span className="flex items-center gap-2">
                      <span className="grid size-8 flex-none place-items-center rounded-full bg-secondary text-inverse">
                        {employee.initials}
                      </span>
                      <span className="flex min-w-0 flex-col gap-0.5">
                        <b className="text-primary">{employee.name}</b>
                        <small className="text-muted">{employee.email}</small>
                      </span>
                    </span>
                  </td>
                  <td className={tableCellClass}>
                    <b className="block text-primary">{employee.role}</b>
                    <small className="mt-1 block text-muted">
                      {employee.jobTitle || employee.department}
                    </small>
                  </td>
                  <td className={tableCellClass}>
                    <b className="block text-primary">
                      {employee.properties?.[0] || "All properties"}
                    </b>
                    {employee.properties?.length > 1 ? (
                      <small className="mt-1 block text-muted">
                        +{employee.properties.length - 1} more
                      </small>
                    ) : null}
                  </td>
                  <td className={tableCellClass}>
                    <span className={statusPillClass(employee.status)}>{employee.status}</span>
                  </td>
                  <td className={tableCellClass}>{employee.lastActive}</td>
                  <td className={`${tableCellClass} text-right`}>
                    <ChevronRight size={15} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td className="border-t border-default p-10 text-center text-muted" colSpan={6}>
                    <Users className="mx-auto mb-2" size={30} />
                    <b className="block text-secondary">No team members found</b>
                    Adjust the search or filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex min-h-12 items-center border-t border-default px-3 text-muted">
          <span>
            Showing {filtered.length} of {safeEmployees.length} team members
          </span>
        </div>
      </section>

      <EmployeeDetail
        key={selected ? selected.id : "none"}
        employee={selected}
        properties={properties}
        onClose={() => setSelected(null)}
      />
      {inviting ? <InviteEmployeeDialog roles={roles} onClose={() => setInviting(false)} /> : null}
    </main>
  );
}
