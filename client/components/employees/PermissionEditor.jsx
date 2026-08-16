"use client";

import { useState } from "react";
import { Building2, Mail, Phone, X } from "lucide-react";
import Button from "@/components/ui/Button";

export default function PermissionEditor({ employee, permissions, onClose }) {
  const [activePermissions, setActivePermissions] = useState(permissions || {});
  if (!employee) return null;

  function togglePermission(module, permission) {
    setActivePermissions((current) => ({
      ...current,
      [module]: current[module].includes(permission)
        ? current[module].filter((item) => item !== permission)
        : [...current[module], permission],
    }));
  }

  return (
    <div
      className="fixed inset-0 z-60 flex justify-end bg-primary/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <aside
        className="h-full w-full max-w-132 overflow-y-auto bg-surface p-6 shadow-[-20px_0_50px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          variant="icon"
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded border-0 bg-primary/40 text-inverse"
          onClick={onClose}
          aria-label="Close permission editor"
        >
          <X size={18} />
        </Button>
        <p className="text-secondary mt-1.75 mb-4">Team member / {employee.id}</p>
        <div className="flex items-center gap-3 my-4.5">
          <span className="w-14 h-14 grid place-items-center rounded-full text-inverse bg-secondary">
            <strong>{employee.initials}</strong>
          </span>
          <div>
            <h2 className="mb-1">{employee.name}</h2>
            <p className="m-0 text-secondary">
              {employee.role} · {employee.department}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-[1fr_1.25fr] gap-2 mb-6">
          <div className="min-w-0 flex items-center gap-2 p-2.5 border border-default rounded-md text-primary">
            <Phone size={15} />
            <span className="min-w-0 flex flex-col gap-0.5">
              <small className="text-muted">Phone</small>
              <b className="truncate">{employee.phone}</b>
            </span>
          </div>
          <div className="min-w-0 flex items-center gap-2 p-2.5 border border-default rounded-md text-primary">
            <Mail size={15} />
            <span className="min-w-0 flex flex-col gap-0.5">
              <small className="text-muted">Email</small>
              <b className="truncate">{employee.email}</b>
            </span>
          </div>
        </div>
        <h3 className="mb-2 mt-0">Assigned properties</h3>
        <div className="flex flex-wrap gap-1.5 my-2 mb-5.5">
          {(employee.properties || []).map((property) => (
            <span
              key={property}
              className="flex items-center gap-1 py-1 px-2 border border-default rounded text-primary bg-sidebar"
            >
              <Building2 size={13} />
              {property}
            </span>
          ))}
        </div>
        <div className="flex items-start justify-between gap-2.5 mt-6">
          <div>
            <h3 className="mb-1 mt-0">Permissions</h3>
            <p className="m-0 text-muted">
              Customize access beyond the default {employee.role} role.
            </p>
          </div>
          <span className="flex-none py-1 px-2 rounded-[10px] text-primary bg-subtle">
            <small>{Object.values(activePermissions).flat().length} enabled</small>
          </span>
        </div>
        <div className="mt-2 border-t border-default">
          {Object.entries(activePermissions).map(([module, enabled]) => (
            <div className="py-3 border-b border-default" key={module}>
              <div className="flex justify-between mb-2">
                <strong className="text-primary">{module}</strong>
                <small className="text-muted">{enabled.length} permissions</small>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "View",
                  "Create",
                  "Edit",
                  "Delete",
                  "Upload",
                  "Send",
                  "Assign",
                  "Export",
                  "Manage",
                ].map((permission) => (
                  <label
                    key={permission}
                    className="flex items-center gap-1 py-1 px-1.5 border border-default rounded text-secondary"
                  >
                    <input
                      type="checkbox"
                      className="accent-primary"
                      checked={enabled.includes(permission)}
                      onChange={() => togglePermission(module, permission)}
                    />
                    <span>{permission}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled title="Permission editing is not available yet">Save permissions</Button>
        </div>
      </aside>
    </div>
  );
}
