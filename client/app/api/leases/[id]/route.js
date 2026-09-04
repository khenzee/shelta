import { authenticatedFetch, passThrough } from "@/lib/server/auth";

async function relay(request, { params }) {
  const { id } = await params;
  const hasBody = request.method !== "GET" && request.method !== "DELETE";
  return passThrough(
    await authenticatedFetch(`leases/${id}`, {
      method: request.method,
      headers: { "content-type": "application/json" },
      body: hasBody ? JSON.stringify(await request.json()) : undefined,
    }),
  );
}
export const GET = relay;
export const PUT = relay;
