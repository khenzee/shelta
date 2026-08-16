import { apiUrl } from "@/lib/server/auth";

export async function POST(request) {
  try {
    const response = await fetch(apiUrl("auth/contacts/verify-email"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });
    return new Response(await response.text(), {
      status: response.status,
      headers: { "content-type": "application/json" },
    });
  } catch {
    return Response.json({ message: "Verification service is unavailable" }, { status: 503 });
  }
}
