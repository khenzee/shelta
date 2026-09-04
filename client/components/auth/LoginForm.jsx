"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Building2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Image from "next/image";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const raw = await response.text();
      let payload = {};
      try {
        payload = raw ? JSON.parse(raw) : {};
      } catch {
        payload = { message: "The server returned an invalid response" };
      }
      if (!response.ok) {
        setError(payload.message || "Unable to sign in");
        setPending(false);
        return;
      }
      const next = searchParams.get("next");
      const destination = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
      window.location.replace(destination);
    } catch {
      setError("Authentication service is unavailable. Start the API and database, then try again.");
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-canvas lg:grid-cols-[minmax(360px,0.8fr)_1.2fr]">
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-[390px]">
          <div className="mb-10 flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-inverse">
              <Building2 size={19} />
            </span>
            <span className="text-lg font-semibold text-primary">Shelta</span>
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Agency access</p>
          <h1 className="text-primary">Sign in to your workspace</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-secondary">
            Use the account issued by your agency administrator.
          </p>

          <form className="mt-8 space-y-5" onSubmit={submit}>
            <label className="block">
              <span className="mb-2 block font-semibold text-primary">Email address</span>
              <span className="flex h-11 items-center gap-3 rounded-md border border-default bg-surface px-3 focus-within:border-secondary">
                <Mail size={16} className="text-muted" />
                <input className="min-w-0 flex-1 border-0 bg-transparent outline-none" name="email" type="email" autoComplete="username" required />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block font-semibold text-primary">Password</span>
              <span className="flex h-11 items-center gap-3 rounded-md border border-default bg-surface px-3 focus-within:border-secondary">
                <LockKeyhole size={16} className="text-muted" />
                <input className="min-w-0 flex-1 border-0 bg-transparent outline-none" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required />
                <button type="button" className="grid size-7 place-items-center border-0 bg-transparent text-muted" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
            {error ? <p className="rounded-md border border-danger/20 bg-danger-subtle px-3 py-2 text-danger">{error}</p> : null}
            <button className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 font-semibold text-inverse disabled:cursor-not-allowed disabled:opacity-50" disabled={pending}>
              {pending ? "Signing in..." : "Continue"}
              {pending ? null : <ArrowRight size={16} />}
            </button>
          </form>
        </div>
      </section>
      <section className="relative rounded-l-4xl hidden overflow-hidden border-l border-default bg-primary p-12 text-inverse lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:52px_52px]" />
        <Image src="https://plus.unsplash.com/premium_photo-1678903964473-1271ecfb0288?q=80&w=1587&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="background" width={900} height={500} className="absolute inset-0 z-0 w-full h-full object-cover" />
        <div className="relative max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-white">Property operations</p>
          <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight text-white">One operational record for every property, tenant, lease, and payment.</h2>
        </div>
        <div className="relative grid max-w-xl grid-cols-3 border-y border-white/50 py-6">
          <div><b className="block text-2xl">Private</b><span className="text-xs text-white">Invitation-only access</span></div>
          <div><b className="block text-2xl">Scoped</b><span className="text-xs text-white">Role and property controls</span></div>
          <div><b className="block text-2xl">Auditable</b><span className="text-xs text-white">Permanent operations trail</span></div>
        </div>
      </section>
    </main>
  );
}
