"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Building2, UserRound, Wrench, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSession } from "@/components/auth/SessionProvider";

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

const VALID_TRANSITIONS = {
  OPEN: ["ASSIGNED", "IN_PROGRESS"],
  ASSIGNED: ["IN_PROGRESS", "OPEN"],
  IN_PROGRESS: ["COMPLETED", "ASSIGNED"],
  COMPLETED: ["VERIFIED"],
  VERIFIED: [],
};

const detailRowClass = "flex justify-between gap-4 border-b border-default py-3";
const detailTermClass = "text-secondary";
const detailValueClass = "m-0 text-right font-semibold";
const fieldClass = "h-10 w-full rounded border border-default bg-surface px-3";
const fieldLabel = "mb-1.5 block font-semibold";

const ASSIGNABLE_ROLES = ["Maintenance Officer", "Property Manager", "Manager", "Agent"];

export default function MaintenanceDetail({ request, employees, onClose, initialAction = null }) {
  const router = useRouter();
  const session = useSession();
  const canManage = ["ADMIN", "MANAGER"].includes(session?.role);
  const [editing, setEditing] = useState(initialAction === "edit");
  const [assigneeId, setAssigneeId] = useState(request?.assigneeId || "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!request) return undefined;
    let cancelled = false;
    fetch(`/api/maintenance/${request.id}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data) setDetail(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [request]);

  if (!request) return null;
  const data = detail || request;
  const statusCode = request.statusCode || request.status;
  const activeIndex = WORKFLOW.findIndex((step) => step.code === statusCode);
  const nextSteps = VALID_TRANSITIONS[statusCode] || [];
  const assignableEmployees = employees.filter((employee) =>
    ASSIGNABLE_ROLES.includes(employee.role),
  );

  async function saveDetails(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    payload.assignedToId = assigneeId || null;
    payload.priority = ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(payload.priority)
      ? payload.priority
      : { Low: "LOW", Medium: "MEDIUM", High: "HIGH", Urgent: "URGENT" }[payload.priority] ||
        "MEDIUM";
    for (const key of ["estimatedCost", "actualCost"]) {
      payload[key] = payload[key] === "" ? 0 : Number(payload[key]);
    }
    if (payload.assignedToId === null) delete payload.assignedToId;
    if (!payload.description) delete payload.description;
    if (!payload.notes) delete payload.notes;
    const response = await fetch(`/api/maintenance/${request.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.message || body.error || "Unable to save changes");
      setPending(false);
      return;
    }
    setEditing(false);
    setPending(false);
    const refreshed = await fetch(`/api/maintenance/${request.id}`, { cache: "no-store" });
    if (refreshed.ok) setDetail(await refreshed.json());
    router.refresh();
  }

  async function moveStatus(nextCode) {
    setPending(true);
    setError("");
    const response = await fetch(`/api/maintenance/${request.id}/status`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: nextCode }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.message || body.error || "Unable to update status");
      setPending(false);
      return;
    }
    setPending(false);
    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-canvas/60" onClick={onClose}>
      <aside
        className="relative h-full w-[min(480px,100%)] overflow-y-auto bg-surface p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded border-0 bg-surface/80 text-primary"
          onClick={onClose}
          aria-label="Close maintenance details"
        >
          <X size={19} />
        </button>

        <p className="font-bold uppercase tracking-wider text-accent">
          Maintenance / {request.category}
        </p>
        <div className="my-3 flex items-start gap-3">
          <span className="grid size-10 flex-none place-items-center rounded bg-subtle text-primary">
            <Wrench size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="m-0">{request.title}</h2>
            <p className="m-0 mt-1 text-muted">
              Reported {request.created} · Updated {request.updated}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1 border-y border-default py-4">
          {WORKFLOW.map((step, index) => {
            const isCurrent = activeIndex === index;
            const isPassed = activeIndex > index;
            const circleClass = isCurrent
              ? step.code === "COMPLETED" || step.code === "VERIFIED"
                ? "grid size-6 place-items-center rounded-full bg-success text-inverse font-bold"
                : step.code === "IN_PROGRESS"
                  ? "grid size-6 place-items-center rounded-full bg-warning text-inverse font-bold"
                  : step.code === "ASSIGNED"
                    ? "grid size-6 place-items-center rounded-full bg-info text-inverse font-bold"
                    : "grid size-6 place-items-center rounded-full bg-primary text-inverse font-bold"
              : isPassed
                ? "grid size-6 place-items-center rounded-full bg-success-subtle text-success"
                : "grid size-6 place-items-center rounded-full bg-subtle text-secondary";
            return (
              <span className="flex flex-col items-center gap-1" key={step.code}>
                <span className={circleClass}>{index + 1}</span>
                <b className={isCurrent ? "text-primary" : "text-muted"}>{step.label}</b>
              </span>
            );
          })}
        </div>

        {canManage && nextSteps.length ? (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-secondary">Move to</span>
            {nextSteps.map((code) => (
              <Button
                key={code}
                variant="secondary"
                disabled={pending}
                onClick={() => moveStatus(code)}
              >
                {WORKFLOW.find((step) => step.code === code)?.label}
                <ArrowRight size={14} />
              </Button>
            ))}
          </div>
        ) : null}
        {canManage && !nextSteps.length ? (
          <p className="mt-4 rounded border border-default bg-sidebar p-3 text-secondary">
            This request is verified and closed.
          </p>
        ) : null}

        {editing ? (
          <form className="mt-5 space-y-3" onSubmit={saveDetails}>
            <h3 className="mt-0">Edit request</h3>
            <label className="block">
              <span className={fieldLabel}>Assigned to</span>
              <select
                className={fieldClass}
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
              >
                <option value="">Unassigned</option>
                {assignableEmployees.map((employee) => (
                  <option key={employee.id} value={employee.userId}>
                    {employee.name} — {employee.role}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <label className="block">
                <span className={fieldLabel}>Priority</span>
                <select className={fieldClass} name="priority" defaultValue={data.priority}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </label>
              <label className="block">
                <span className={fieldLabel}>Estimated cost (₦)</span>
                <input
                  className={fieldClass}
                  name="estimatedCost"
                  type="number"
                  min="0"
                  defaultValue={Number(data.estimatedCost || 0)}
                />
              </label>
              <label className="block">
                <span className={fieldLabel}>Actual cost (₦)</span>
                <input
                  className={fieldClass}
                  name="actualCost"
                  type="number"
                  min="0"
                  defaultValue={Number(data.actualCost || 0)}
                />
              </label>
            </div>
            <label className="block">
              <span className={fieldLabel}>Description</span>
              <textarea
                className="rounded border border-default bg-surface p-3 outline-none"
                name="description"
                rows={3}
                defaultValue={data.description || request.description}
              />
            </label>
            {error ? <p className="rounded bg-danger-subtle p-3 text-danger">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button disabled={pending}>{pending ? "Saving..." : "Save changes"}</Button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="mt-5">Request details</h3>
            <p className="text-secondary">{request.description}</p>
            <dl className="m-0 mt-3 border-t border-default">
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Property</dt>
                <dd className={detailValueClass}>
                  {request.property}
                  {request.unit !== "Unassigned" ? ` · Unit ${request.unit}` : ""}
                </dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Reported by</dt>
                <dd className={detailValueClass}>{request.tenant || "Agency operations"}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Priority</dt>
                <dd className={detailValueClass}>{request.priority}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Assigned to</dt>
                <dd className={detailValueClass}>{request.assignee || "Unassigned"}</dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Estimated cost</dt>
                <dd className={detailValueClass}>
                  {request.estimatedCost > 0 ? money.format(request.estimatedCost) : "—"}
                </dd>
              </div>
              <div className={detailRowClass}>
                <dt className={detailTermClass}>Actual cost</dt>
                <dd className={detailValueClass}>
                  {request.actualCost > 0 ? money.format(request.actualCost) : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className={detailTermClass}>Landlord</dt>
                <dd className={detailValueClass}>{request.landlord || "—"}</dd>
              </div>
            </dl>
          </>
        )}

        {!editing && canManage ? (
          <Button variant="secondary" className="mt-5 w-full" onClick={() => setEditing(true)}>
            <UserRound size={15} /> Edit assignment and costs
          </Button>
        ) : null}
      </aside>
    </div>
  );
}
