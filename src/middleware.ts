import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/profile"];

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const urlToken = req.nextUrl.searchParams.get("token");

  const path = req.nextUrl.pathname;
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  if (isProtected && !token && !urlToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
