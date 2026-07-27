import { redirect } from "next/navigation";
import { requireUser } from "@/lib/guards";
import { SiteHeader } from "@/components/site/SiteHeader";

/**
 * Wraps every route under /bookings. Any signed-in user (USER or ADMIN) can
 * view their own bookings — this is not an admin-only area. Guarded here
 * (not via middleware) because `requireUser()` checks the public site's own
 * JWT cookie, which needs the Node `jsonwebtoken` package rather than the
 * Edge runtime middleware uses for /admin.
 */
export default async function BookingsLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  if (!session?.user) {
    redirect("/login?callbackUrl=/bookings");
  }

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
