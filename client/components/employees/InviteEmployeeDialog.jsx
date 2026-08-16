"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";
import Button from "@/components/ui/Button";

export default function InviteEmployeeDialog({ roles, onClose }) {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/employees/invitations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload.message || payload.error;
      setError(Array.isArray(message) ? message.join(", ") : message || "Unable to send invitation");
      setPending(false);
      return;
    }
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-primary/45 p-4" onClick={onClose}>
      <section className="w-full max-w-md rounded-md border border-default bg-surface p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div><p className="section-kicker">Team access</p><h2 className="mt-1">Invite team member</h2></div>
          <Button variant="icon" onClick={onClose} aria-label="Close"><X size={16} /></Button>
        </div>
        {sent ? (
          <div className="mt-6 rounded-md border border-success/20 bg-success-subtle p-5 text-success"><Mail className="mb-3" size={20} /><strong>Invitation sent</strong><p className="mt-1">The activation link expires in 48 hours.</p></div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block"><span className="mb-1.5 block font-semibold">Full name</span><input name="name" required minLength={2} className="h-10 w-full rounded border border-default px-3" /></label>
            <label className="block"><span className="mb-1.5 block font-semibold">Email</span><input name="email" required type="email" className="h-10 w-full rounded border border-default px-3" /></label>
            <label className="block"><span className="mb-1.5 block font-semibold">Role</span><select name="roleId" required className="h-10 w-full rounded border border-default bg-surface px-3"><option value="">Select role</option>{roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label>
            <label className="block"><span className="mb-1.5 block font-semibold">Department</span><input name="department" className="h-10 w-full rounded border border-default px-3" /></label>
            <label className="block"><span className="mb-1.5 block font-semibold">Job title</span><input name="jobTitle" className="h-10 w-full rounded border border-default px-3" /></label>
            {error ? <p className="rounded bg-danger-subtle p-3 text-danger">{error}</p> : null}
            <div className="flex justify-end gap-2"><Button variant="secondary" type="button" onClick={onClose}>Cancel</Button><Button disabled={pending}>{pending ? "Sending..." : "Send invitation"}</Button></div>
          </form>
        )}
      </section>
    </div>
  );
}
