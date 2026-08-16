"use client";

import { useState } from "react";
import { FileText, Mail, Paperclip, Send, X } from "lucide-react";
import Button from "@/components/ui/Button";

const fieldLabelClass = "flex flex-col gap-1.5";
const fieldTitleClass = "font-semibold text-secondary";
const inputClass = "h-10 rounded border border-default bg-surface px-3 outline-none";

export default function ComposeMessage({ tenants, documents, initialRecipient, onClose }) {
  const [recipient, setRecipient] = useState(initialRecipient || "");
  const [subject, setSubject] = useState("Your tenancy documents");
  const [message, setMessage] = useState(
    "Hello,\n\nPlease find the requested tenancy document attached for your records.\n\nRegards,\nNorth & Haven Property Management",
  );
  const [attachment, setAttachment] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end bg-primary/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <aside
        className="relative h-full w-full max-w-[430px] overflow-y-auto bg-surface p-6 shadow-[-20px_0_50px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          variant="icon"
          className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded border-0 bg-subtle text-primary"
          onClick={onClose}
          aria-label="Close email composer"
        >
          <X size={18} />
        </Button>
        <p className="section-kicker">Communication / Email</p>
        <div className="my-[18px] flex items-center gap-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded bg-subtle text-primary">
            <Mail size={19} />
          </span>
          <div>
            <h2 className="m-0">Email tenant</h2>
            <p className="mt-1 text-secondary">Send a message with an optional legal document.</p>
          </div>
        </div>
        {sent ? (
          <div className="my-8 flex flex-col items-center gap-3 rounded-md border border-default bg-sidebar p-6 text-center text-secondary">
            <Send size={22} />
            <strong className="text-primary">Message queued</strong>
            <p>The email and document will be recorded in communication history.</p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <label className={fieldLabelClass}>
              <span className={fieldTitleClass}>Recipient</span>
              <select
                className={inputClass}
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
              >
                <option value="">Select tenant</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.email}>
                    {tenant.name} · {tenant.email}
                  </option>
                ))}
              </select>
            </label>
            <label className={fieldLabelClass}>
              <span className={fieldTitleClass}>Subject</span>
              <input
                className={inputClass}
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              />
            </label>
            <label className={fieldLabelClass}>
              <span className={fieldTitleClass}>Message</span>
              <textarea
                className="rounded border border-default bg-surface p-3 outline-none"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={9}
              />
            </label>
            <label className={fieldLabelClass}>
              <span className={fieldTitleClass}>Attach document</span>
              <select
                className={inputClass}
                value={attachment}
                onChange={(event) => setAttachment(event.target.value)}
              >
                <option value="">No attachment</option>
                {documents.map((document) => (
                  <option key={document.id}>{document.name}</option>
                ))}
              </select>
            </label>
            {attachment ? (
              <div className="flex items-center gap-2 rounded border border-default bg-sidebar p-2.5 text-primary">
                <FileText size={16} />
                <span className="flex flex-col gap-0.5">
                  <b>{attachment}</b>
                  <small className="text-muted">PDF document</small>
                </span>
                <button
                  className="ml-auto border-0 bg-transparent text-secondary"
                  onClick={() => setAttachment("")}
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between gap-2">
              <Button variant="secondary">
                <Paperclip size={14} /> Upload file
              </Button>
              <Button disabled title="Email sending is not available yet">
                <Send size={14} /> Send email
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
