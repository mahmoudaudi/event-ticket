import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

function parseCookies(request: Request): Record<string, string> {
  const cookie = request.headers.get("cookie") || "";
  return Object.fromEntries(
    cookie.split(";").map((c) => {
      const i = c.indexOf("=");
      return [c.slice(0, i).trim(), c.slice(i + 1).trim()];
    })
  );
}

function getRole(request: any): string | null {
  const cookies = parseCookies(request);
  try {
    const userData = JSON.parse(decodeURIComponent(cookies["user"] || ""));
    if (userData.role) return userData.role;
  } catch {}
  return null;
}

const { auth: nextAuthMiddleware } = NextAuth(authConfig);

export async function middleware(request: any) {
  const url = request.nextUrl.pathname;

  // Check our own JWT cookie FIRST (faster, no next-auth dependency)
  const role = getRole(request);

  // Admin routes — only ADMIN role allowed
  if (url.startsWith("/admin")) {
    if (url === "/admin/login") return;
    if (role === "ADMIN") return;
    // Fallback: check NextAuth session (for users who logged in via /admin/login)
    const session = await nextAuthMiddleware(request);
    if (session?.user?.role === "ADMIN") return;
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", url);
    return Response.redirect(loginUrl);
  }

  // Dashboard — only USER role allowed
  if (url === "/dashboard") {
    if (role === "ADMIN") {
      return Response.redirect(new URL("/admin", request.url));
    }
    const session = await nextAuthMiddleware(request);
    if (session?.user?.role === "ADMIN") {
      return Response.redirect(new URL("/admin", request.url));
    }
  }
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/dashboard"],
};
