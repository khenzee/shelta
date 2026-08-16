"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, CheckCircle2 } from "lucide-react";

export default function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`/api/auth/invitations?token=${encodeURIComponent(token)}`)
      .then(async (response) => ({ ok: response.ok, payload: await response.json().catch(() => ({})) }))
      .then(({ ok, payload }) => {
        if (!active) return;
        if (!ok) setError(payload.message || "Invitation is invalid or expired");
        else setInvitation(payload);
      })
      .catch(() => active && setError("Unable to validate invitation"));
    return () => { active = false; };
  }, [token]);

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    if (password !== form.get("confirmPassword")) {
      setError("Passwords do not match");
      return;
    }
    setPending(true);
    setError("");
    const response = await fetch("/api/auth/invitations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(Array.isArray(payload.message) ? payload.message.join(", ") : payload.message || "Unable to accept invitation");
      setPending(false);
      return;
    }
    setAccepted(true);
    setTimeout(() => router.replace("/login"), 1200);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-5">
      <section className="w-full max-w-md rounded-md border border-default bg-surface p-7 shadow-sm">
        <div className="mb-7 flex items-center gap-3"><span className="grid size-9 place-items-center rounded bg-primary text-inverse"><Building2 size={18} /></span><strong className="text-lg">Shelta</strong></div>
        {accepted ? <div className="py-10 text-center"><CheckCircle2 className="mx-auto mb-3 text-success" size={30} /><h1>Account activated</h1><p className="mt-2 text-secondary">Redirecting you to sign in.</p></div> : (
          <>
            <p className="section-kicker">Invitation</p>
            <h1 className="mt-1">Set your password</h1>
            <p className="mt-2 text-secondary">{invitation ? `${invitation.name}, you were invited as ${invitation.role || "a team member"}.` : "Validating your invitation..."}</p>
            {invitation ? <form className="mt-6 space-y-4" onSubmit={submit}><label className="block"><span className="mb-1.5 block font-semibold">Password</span><input className="h-10 w-full rounded border border-default px-3" name="password" type="password" minLength={12} required /></label><label className="block"><span className="mb-1.5 block font-semibold">Confirm password</span><input className="h-10 w-full rounded border border-default px-3" name="confirmPassword" type="password" minLength={12} required /></label><button className="h-10 w-full rounded bg-primary font-semibold text-inverse disabled:opacity-50" disabled={pending}>{pending ? "Activating..." : "Activate account"}</button></form> : null}
            {error ? <p className="mt-4 rounded bg-danger-subtle p-3 text-danger">{error}</p> : null}
          </>
        )}
      </section>
    </main>
  );
}
