import { authenticatedFetch, passThrough } from "@/lib/server/auth";

export async function PUT(_request, { params }) {
  const { id } = await params;
  return passThrough(await authenticatedFetch(`finances/${id}/void`, { method: "PUT" }));
}
