import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/guards";
import { bulkUpdateBookingStatus } from "@/lib/admin/bookings";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});

export async function PATCH(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updatedCount = await bulkUpdateBookingStatus(parsed.data.ids, parsed.data.status, {
    id: session.user.id,
    name: session.user.name ?? "Admin",
  });

  return NextResponse.json({ success: true, updatedCount });
}
