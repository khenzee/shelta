"use client";

import { useDeferredValue, useState } from "react";
import {
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
import PermissionEditor from "./PermissionEditor";

export default function TeamClient({ employees, rolePermissions }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All roles");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState(null);
  const deferredSearch = useDeferredValue(search);
  const filtered = employees.filter(
    (employee) =>
      `${employee.name} ${employee.email} ${employee.department} ${employee.role}`
        .toLowerCase()
        .includes(deferredSearch.toLowerCase()) &&
      (role === "All roles" || employee.role === role) &&
      (status === "All statuses" || employee.status === status),
  );

  return (
    <main className="p-8 max-md:p-4">
      <section className="mb-6 flex items-center justify-between gap-5 max-md:flex-col max-md:items-start">
        <div>
          <p className="section-kicker">Administration / Team</p>
          <h1>Team and permissions</h1>
          <p>Control who can access landlord portfolios, finances, documents, and operations.</p>
        </div>
        <Button>
          <Plus size={16} /> Invite team member
        </Button>
      </section>
      <section className="mb-3.5 grid grid-cols-4 gap-3 max-[1050px]:grid-cols-2 max-[440px]:grid-cols-1">
        <div className="min-w-0 flex items-center gap-2.5 p-3.5 border border-default rounded-md bg-surface">
          <span className="w-8.5 h-8.5 grid place-items-center flex-none rounded text-primary bg-subtle">
            <Users size={17} />
          </span>
          <div className="min-w-0 flex flex-col gap-0.5">
            <small className="text-secondary">Team members</small>
            <strong className="text-primary">6</strong>
            <b className="text-muted">5 active accounts</b>
          </div>
        </div>
        <div className="min-w-0 flex items-center gap-2.5 p-3.5 border border-default rounded-md bg-surface">
          <span className="w-8.5 h-8.5 grid place-items-center flex-none rounded text-primary bg-subtle">
            <ShieldCheck size={17} />
          </span>
          <div className="min-w-0 flex flex-col gap-0.5">
            <small className="text-secondary">Roles configured</small>
            <strong className="text-primary">5</strong>
            <b className="text-muted">Granular access</b>
          </div>
        </div>
        <div className="min-w-0 flex items-center gap-2.5 p-3.5 border border-default rounded-md bg-surface">
          <span className="w-8.5 h-8.5 grid place-items-center flex-none rounded text-primary bg-subtle">
            <UserCheck size={17} />
          </span>
          <div className="min-w-0 flex flex-col gap-0.5">
            <small className="text-secondary">Active now</small>
            <strong className="text-primary">4</strong>
            <b className="text-muted">Across 3 departments</b>
          </div>
        </div>
        <div className="min-w-0 flex items-center gap-2.5 p-3.5 border border-default rounded-md bg-surface">
          <span className="w-8.5 h-8.5 grid place-items-center flex-none rounded text-primary bg-subtle">
            <UserRoundCog size={17} />
          </span>
          <div className="min-w-0 flex flex-col gap-0.5">
            <small className="text-secondary">Pending action</small>
            <strong className="text-primary">2</strong>
            <b className="text-muted">Invite and suspension</b>
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-md border border-default bg-surface">
        <div className="flex items-center gap-2 p-3 border-b border-default">
          <label className="flex h-9 min-w-75 items-center gap-1.75 rounded border border-default bg-sidebar px-2.5 text-muted">
            <Search size={16} />
            <input
              className="min-w-0 flex-1 border-0 outline-none bg-transparent"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, role or department"
            />
          </label>
          <select
            className="h-9 min-w-33.75 rounded border border-default bg-surface pl-2.5 pr-6.75 text-primary outline-none"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            aria-label="Filter role"
          >
            <option>All roles</option>
            {Object.keys(rolePermissions).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className="h-9 min-w-33.75 rounded border border-default bg-surface pl-2.5 pr-6.75 text-primary outline-none"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter status"
          >
            <option>All statuses</option>
            <option>Active</option>
            <option>Invited</option>
            <option>Suspended</option>
          </select>
          <button className="ml-auto flex h-9.5 items-center justify-center gap-1.75 rounded-md border border-default bg-surface px-3.25 font-semibold text-primary">
            Sort: Last active <ChevronDown size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-195 border-collapse text-left">
            <thead>
              <tr>
                <th className="h-9.25 px-3 text-muted bg-sidebar whitespace-nowrap">Team member</th>
                <th className="h-9.25 px-3 text-muted bg-sidebar whitespace-nowrap">Role</th>
                <th className="h-9.25 px-3 text-muted bg-sidebar whitespace-nowrap">
                  Assigned properties
                </th>
                <th className="h-9.25 px-3 text-muted bg-sidebar whitespace-nowrap">Status</th>
                <th className="h-9.25 px-3 text-muted bg-sidebar whitespace-nowrap">Last active</th>
                <th className="h-9.25 px-3 text-muted bg-sidebar whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((employee) => {
                const statusClasses =
                  employee.status.toLowerCase() === "invited"
                    ? "inline-flex rounded px-2 py-1 font-bold text-warning bg-warning-subtle"
                    : employee.status.toLowerCase() === "suspended"
                      ? "inline-flex rounded px-2 py-1 font-bold text-danger bg-danger-subtle"
                      : "inline-flex rounded px-2 py-1 font-bold text-success bg-success-subtle";

                return (
                  <tr
                    key={employee.id}
                    onClick={() => setSelected(employee)}
                    className="cursor-pointer hover:bg-hover"
                  >
                    <td className="h-15.75 px-3 border-t border-default text-secondary whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 grid place-items-center rounded-full text-inverse bg-secondary">
                          {employee.initials}
                        </span>
                        <div className="min-w-0 flex flex-col gap-0.5">
                          <b className="text-primary">{employee.name}</b>
                          <small className="text-muted">{employee.email}</small>
                        </div>
                      </div>
                    </td>
                    <td className="h-15.75 px-3 border-t border-default text-secondary whitespace-nowrap">
                      <b className="block text-primary">{employee.role}</b>
                      <small className="block mt-1 text-muted">{employee.department}</small>
                    </td>
                    <td className="h-15.75 px-3 border-t border-default text-secondary whitespace-nowrap">
                      <b className="block text-primary">{employee.properties[0]}</b>
                      <small className="block mt-1 text-muted">
                        {employee.properties.length > 1
                          ? `+${employee.properties.length - 1} more`
                          : ""}
                      </small>
                    </td>
                    <td className="h-15.75 px-3 border-t border-default text-secondary whitespace-nowrap">
                      <span className={statusClasses}>{employee.status}</span>
                    </td>
                    <td className="h-15.75 px-3 border-t border-default text-secondary whitespace-nowrap">
                      {employee.lastActive}
                    </td>
                    <td className="h-15.75 px-3 border-t border-default text-secondary whitespace-nowrap text-right">
                      <ChevronRight size={15} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex min-h-12 items-center border-t border-default px-3 py-2 text-secondary">
          <span>{filtered.length} team members</span>
        </div>
      </section>
      <PermissionEditor
        employee={selected}
        permissions={selected ? rolePermissions[selected.role] : {}}
        onClose={() => setSelected(null)}
      />
    </main>
  );
}
