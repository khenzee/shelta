import { NextResponse } from "next/server";
import { authenticatedFetch, clearAuthCookies } from "@/lib/server/auth";

export async function POST() {
  await authenticatedFetch("auth/logout", { method: "POST" });
  await clearAuthCookies();
  return NextResponse.json({ message: "Logged out" });
}
