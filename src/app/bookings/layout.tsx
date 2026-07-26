import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SiteHeader } from "@/components/site/SiteHeader";

/**
 * Wraps every route under /bookings. Any signed-in user (USER or ADMIN) can
 * view their own bookings — this is not an admin-only area. The middleware
 * already redirects signed-out visitors before this renders; this
 * server-side check is defense-in-depth, same pattern as /admin.
 */
export default async function BookingsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/bookings");
  }

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader userName={session.user.name ?? "Account"} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
