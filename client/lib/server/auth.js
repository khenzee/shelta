import "server-only";

import { cookies } from "next/headers";

export const ACCESS_COOKIE = "shelta_access";
export const REFRESH_COOKIE = "shelta_refresh";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:4000/api/v1";
const secure = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure,
  sameSite: "lax",
  path: "/",
};

export function apiUrl(path) {
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
}

export async function setAuthCookies(tokens) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 });
  store.set(REFRESH_COOKIE, tokens.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function refreshAuth() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  let response;
  try {
    response = await fetch(apiUrl("auth/refresh"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) {
    await clearAuthCookies();
    return null;
  }

  const tokens = await response.json();
  await setAuthCookies(tokens);
  return tokens.accessToken;
}

export async function authenticatedFetch(path, init = {}, options = {}) {
  let accessToken = await getAccessToken();
  if (!accessToken && options.allowRefresh) accessToken = await refreshAuth();
  if (!accessToken) return new Response(null, { status: 401 });

  const request = () =>
    fetch(apiUrl(path), {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init.headers).entries()),
        authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

  let response;
  try {
    response = await request();
  } catch {
    return Response.json(
      { message: "API service is unavailable" },
      { status: 503 },
    );
  }
  if (response.status === 401) {
    if (!options.allowRefresh) return response;
    accessToken = await refreshAuth();
    if (!accessToken) return response;
    try {
      response = await request();
    } catch {
      return Response.json(
        { message: "API service is unavailable" },
        { status: 503 },
      );
    }
  }
  return response;
}

export async function passThrough(response) {
  const body = response.status === 204 ? null : await response.arrayBuffer();
  return new Response(body, {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") || "application/json" },
  });
}
