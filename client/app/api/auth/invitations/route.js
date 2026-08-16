import { apiUrl } from "@/lib/server/auth";

async function relay(response) {
  const text = await response.text();
  return new Response(text || JSON.stringify({ message: "Empty response" }), {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}

export async function GET(request) {
  const token = new URL(request.url).searchParams.get("token") || "";
  try {
    return relay(await fetch(apiUrl(`auth/invitations?token=${encodeURIComponent(token)}`), { cache: "no-store" }));
  } catch {
    return Response.json({ message: "Authentication service is unavailable" }, { status: 503 });
  }
}

export async function POST(request) {
  try {
    return relay(await fetch(apiUrl("auth/invitations/accept"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    }));
  } catch {
    return Response.json({ message: "Authentication service is unavailable" }, { status: 503 });
  }
}
