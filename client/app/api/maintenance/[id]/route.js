import { authenticatedFetch, passThrough } from "@/lib/server/auth";

export async function PUT(request, { params }) {
  const { id } = await params;
  return passThrough(await authenticatedFetch(`maintenance/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(await request.json()),
  }));
}
