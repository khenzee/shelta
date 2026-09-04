import { authenticatedFetch, passThrough } from "@/lib/server/auth";

export async function PATCH(_request, { params }) {
  const { id } = await params;
  return passThrough(await authenticatedFetch(`notifications/${id}/read`, { method: "PATCH" }));
}
