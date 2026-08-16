import { NextResponse } from "next/server";

export function proxy(request) {
  const authenticated = request.cookies.has("shelta_access");
  const loginUrl = new URL("/login", request.url);

  if (!authenticated) {
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/properties/:path*",
    "/units/:path*",
    "/tenants/:path*",
    "/landlords/:path*",
    "/leases/:path*",
    "/finances/:path*",
    "/maintenance/:path*",
    "/employees/:path*",
    "/reports/:path*",
    "/portal/:path*",
  ],
};
