import { authenticatedFetch, passThrough } from "@/lib/server/auth";

const statusCodes = {
  Open: "OPEN",
  Assigned: "ASSIGNED",
  "In Progress": "IN_PROGRESS",
  Completed: "COMPLETED",
  Verified: "VERIFIED",
};

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  return passThrough(await authenticatedFetch(`maintenance/${id}/status`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...body, status: statusCodes[body.status] || body.status }),
  }));
}
