import { NextResponse } from "next/server";
import { apiUrl, setAuthCookies } from "@/lib/server/auth";

export async function POST(request) {
  try {
    const response = await fetch(apiUrl("auth/login"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });
    const raw = await response.text();
    let payload = {};
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = { message: "The authentication service returned an invalid response" };
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: payload.message || "Unable to sign in" },
        { status: response.status },
      );
    }

    await setAuthCookies(payload);
    return NextResponse.json({ user: payload.user });
  } catch {
    return NextResponse.json(
      { message: "Authentication service is unavailable. Start the API and database, then try again." },
      { status: 503 },
    );
  }
}
