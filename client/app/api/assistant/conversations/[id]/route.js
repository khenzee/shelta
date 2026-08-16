import { authenticatedFetch, passThrough } from "@/lib/server/auth";

export async function GET(_request, { params }) {
  const { id } = await params;
  return passThrough(await authenticatedFetch(`ai/conversations/${id}`));
}
