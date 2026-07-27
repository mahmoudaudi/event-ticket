import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/admin/Sidebar";
import { MobileSidebarProvider } from "@/components/admin/MobileSidebarContext";

/**
 * Wraps every protected route under /admin (not /admin/login). The
 * middleware already redirects non-admins before this ever renders, but
 * this server-side check is kept as defense-in-depth in case the route is
 * reached another way (e.g. a server action or a future matcher change).
 *
 * SessionProvider and ToastProvider are mounted once at `src/app/admin/layout.tsx`
 * and cover this whole admin section (including /admin/login).
 * MobileSidebarProvider is scoped here since only the admin shell needs it.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    return (
      <MobileSidebarProvider>
        <div className="flex min-h-screen bg-cream">
          <Sidebar adminName={session.user.name ?? "Admin"} />
          <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
        </div>
      </MobileSidebarProvider>
    );
  }

  // Fallback: check app's JWT user cookie
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    if (userCookie) {
      const userData = JSON.parse(decodeURIComponent(userCookie.value));
      if (userData.role === "ADMIN") {
        return (
          <MobileSidebarProvider>
            <div className="flex min-h-screen bg-cream">
              <Sidebar adminName={userData.firstName ? `${userData.firstName} ${userData.lastName || ""}` : "Admin"} />
              <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
            </div>
          </MobileSidebarProvider>
        );
      }
    }
  } catch {}

  redirect("/admin/login?callbackUrl=/admin");
}
