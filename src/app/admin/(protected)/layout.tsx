import { redirect } from "next/navigation";
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
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login?callbackUrl=/admin");
  }

  return (
    <MobileSidebarProvider>
      <div className="flex min-h-screen bg-cream">
        <Sidebar adminName={session.user.name ?? "Admin"} />
        <div className="min-w-0 flex-1 overflow-x-hidden">{children}</div>
      </div>
    </MobileSidebarProvider>
  );
}
