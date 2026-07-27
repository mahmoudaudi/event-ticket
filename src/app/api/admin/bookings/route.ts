import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { getAdminBookingsList, type BookingDateRange } from "@/lib/admin/bookings";
import { withErrorLogging } from "@/lib/withErrorLogging";

export const GET = withErrorLogging(async (request: Request) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const dateRange = (searchParams.get("dateRange") as BookingDateRange | null) ?? undefined;

  const result = await getAdminBookingsList({ page, search, status, dateRange });
  return NextResponse.json(result);
});
