import { authenticatedFetch, passThrough } from "@/lib/server/auth";

export async function POST(request) {
  return passThrough(await authenticatedFetch("employees/invitations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(await request.json()),
  }));
}
