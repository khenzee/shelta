"use client";

import { useState } from "react";
import { Building2, Camera, FileText, UserRound, Wrench, X } from "lucide-react";
import Button from "@/components/ui/Button";

const workflow = ["Open", "Assigned", "In Progress", "Completed", "Verified"];
const detailCardClass = "flex items-center gap-2 rounded border border-default p-2.5";
const detailBodyClass = "flex flex-col gap-0.5";
const fieldLabelClass = "flex flex-col gap-1.5";
const fieldTitleClass = "font-semibold text-secondary";
const fieldClass = "h-10 rounded border border-default bg-surface px-3";

export default function MaintenanceDetail({ request, employees, onClose }) {
  const [status, setStatus] = useState(request?.status || "Open");
  const [assignee, setAssignee] = useState(request?.assignee || "");
  if (!request) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-primary/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <aside
        className="relative h-full w-full max-w-[520px] overflow-y-auto bg-surface p-6 shadow-[-20px_0_50px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          variant="icon"
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded border-0 bg-subtle text-primary"
          onClick={onClose}
          aria-label="Close maintenance details"
        >
          <X size={18} />
        </Button>
        <p className="section-kicker">Maintenance / {request.id}</p>
        <div className="my-[18px] flex items-start gap-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded bg-subtle text-primary">
            <Wrench size={20} />
          </span>
          <div>
            <small>{request.category}</small>
            <h2 className="m-0">{request.title}</h2>
            <p className="mt-1 text-secondary">
              Reported {request.created} · Updated {request.updated}
            </p>
          </div>
        </div>
        <div className="mb-6 grid grid-cols-5 gap-1 border-y border-default py-3">
          {workflow.map((step, index) => {
            const activeIndex = workflow.indexOf(status);
            const isCurrent = activeIndex === index;
            const isPassed = activeIndex > index;

            let circleClass =
              "grid h-6 w-6 place-items-center rounded-full bg-subtle text-secondary";
            let textClass = "text-muted";

            if (isCurrent) {
              textClass = "text-primary font-bold";
              if (step === "Completed" || step === "Verified") {
                circleClass =
                  "grid h-6 w-6 place-items-center rounded-full bg-success text-inverse font-bold";
                textClass = "text-success font-bold";
              } else if (step === "In Progress") {
                circleClass =
                  "grid h-6 w-6 place-items-center rounded-full bg-warning text-inverse font-bold";
                textClass = "text-warning font-bold";
              } else if (step === "Assigned") {
                circleClass =
                  "grid h-6 w-6 place-items-center rounded-full bg-info text-inverse font-bold";
                textClass = "text-info font-bold";
              } else {
                circleClass =
                  "grid h-6 w-6 place-items-center rounded-full bg-primary text-inverse font-bold";
              }
            } else if (isPassed) {
              circleClass =
                "grid h-6 w-6 place-items-center rounded-full bg-success-subtle text-success";
              textClass = "text-secondary";
            }

            return (
              <button
                className="flex flex-col items-center gap-1 border-0 bg-transparent"
                key={step}
                onClick={() => setStatus(step)}
              >
                <span className={circleClass}>{index + 1}</span>
                <b className={textClass}>{step}</b>
              </button>
            );
          })}
        </div>
        <h3>Request details</h3>
        <p className="text-secondary">{request.description}</p>
        <div className="my-5 grid gap-2">
          <div className={detailCardClass}>
            <Building2 size={15} />
            <span className={detailBodyClass}>
              <small className="text-muted">Property</small>
              <b className="text-primary">
                {request.property} · Unit {request.unit}
              </b>
            </span>
          </div>
          <div className={detailCardClass}>
            <UserRound size={15} />
            <span className={detailBodyClass}>
              <small className="text-muted">Reported by</small>
              <b className="text-primary">{request.tenant || "Agency operations"}</b>
            </span>
          </div>
          <div className={detailCardClass}>
            <Camera size={15} />
            <span className={detailBodyClass}>
              <small className="text-muted">Evidence</small>
              <b className="text-primary">{request.photos} uploaded photos</b>
            </span>
          </div>
        </div>
        <h3>Assignment and cost</h3>
        <div className="flex flex-col gap-3">
          <label className={fieldLabelClass}>
            <span className={fieldTitleClass}>Assigned to</span>
            <select
              className={fieldClass}
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
            >
              <option value="">Unassigned</option>
              {employees
                .filter(
                  (employee) =>
                    employee.role === "Maintenance Officer" || employee.role === "Property Manager",
                )
                .map((employee) => (
                  <option key={employee.id}>{employee.name}</option>
                ))}
              <option>CoolAir Services</option>
              <option>PowerPro Engineering</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <label className={fieldLabelClass}>
              <span className={fieldTitleClass}>Priority</span>
              <select className={fieldClass} defaultValue={request.priority}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <label className={fieldLabelClass}>
              <span className={fieldTitleClass}>Estimated cost</span>
              <input className={fieldClass} type="number" defaultValue={request.estimatedCost} />
            </label>
          </div>
        </div>
        <div className="my-5 flex items-center gap-2 rounded border border-default bg-sidebar p-3 text-primary">
          <FileText size={16} />
          <span className="flex flex-1 flex-col gap-0.5">
            <b>{request.invoice || "No invoice uploaded"}</b>
            <small className="text-muted">
              {request.invoice ? "Attached to maintenance history" : "Upload when work is invoiced"}
            </small>
          </span>
          <Button variant="secondary" disabled title="Invoice uploads are not available yet">{request.invoice ? "View" : "Upload"}</Button>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled title="Maintenance updates are not connected yet">Save update</Button>
        </div>
      </aside>
    </div>
  );
}
