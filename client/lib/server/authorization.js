import "server-only";

import { redirect } from "next/navigation";
import { authenticatedFetch } from "./auth";

export async function requireRole(allowedRoles) {
  const response = await authenticatedFetch("auth/session");
  if (response.status === 401) redirect("/login");
  if (!response.ok) redirect("/");

  const session = await response.json();
  if (!allowedRoles.includes(session.role)) redirect("/");
  return session;
}
