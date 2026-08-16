"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, CircleAlert } from "lucide-react";

export default function VerifyContactEmail() {
  const params = useSearchParams();
  const [state, setState] = useState("pending");

  useEffect(() => {
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: params.get("type"), token: params.get("token") }),
    }).then((response) => setState(response.ok ? "verified" : "error")).catch(() => setState("error"));
  }, [params]);

  return <main className="grid min-h-screen place-items-center bg-canvas p-5"><section className="w-full max-w-md rounded-md border border-default bg-surface p-8 text-center shadow-sm">{state === "pending" ? <><h1>Verifying email</h1><p className="mt-2 text-secondary">Please wait while Shelta verifies your link.</p></> : state === "verified" ? <><CheckCircle2 className="mx-auto mb-4 text-success" size={34} /><h1>Email verified</h1><p className="mt-2 text-secondary">Your agency contact record is now verified.</p></> : <><CircleAlert className="mx-auto mb-4 text-danger" size={34} /><h1>Link unavailable</h1><p className="mt-2 text-secondary">This verification link is invalid or has expired.</p></>}</section></main>;
}
