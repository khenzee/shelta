import { authenticatedFetch, passThrough } from "@/lib/server/auth";

export async function GET() {
  return passThrough(
    await authenticatedFetch("auth/session", {}, { allowRefresh: true }),
  );
}
