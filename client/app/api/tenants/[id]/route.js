import { authenticatedFetch, passThrough } from "@/lib/server/auth";

async function relay(request, { params }) {
  const { id } = await params;
  const hasBody = !["GET", "DELETE"].includes(request.method);
  return passThrough(await authenticatedFetch(`tenants/${id}`, {
    method: request.method,
    headers: { "content-type": "application/json" },
    body: hasBody ? JSON.stringify(await request.json()) : undefined,
  }));
}
export const GET = relay;
export const PUT = relay;
export const DELETE = relay;
