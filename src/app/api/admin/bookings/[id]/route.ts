import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/guards";
import { getAdminBookingDetail, updateBookingStatus } from "@/lib/admin/bookings";

const statusSchema = z.object({ status: z.enum(["CONFIRMED", "CANCELLED"]) });

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const booking = await getAdminBookingDetail(id);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  return NextResponse.json(booking);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await updateBookingStatus(id, parsed.data.status, {
    id: session.user.id,
    name: session.user.name ?? "Admin",
  });
  if (!updated) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
