import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { getAdminBookingsForExport, type BookingDateRange } from "@/lib/admin/bookings";
import { toCsv } from "@/lib/csv";
import { formatDate } from "@/lib/format";
import { withErrorLogging } from "@/lib/withErrorLogging";

export const GET = withErrorLogging(async (request: Request) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const dateRange = (searchParams.get("dateRange") as BookingDateRange | null) ?? undefined;

  const bookings = await getAdminBookingsForExport({ search, status, dateRange });

  const csv = toCsv(
    ["Booking Reference", "Customer", "Email", "Event", "Date", "Total", "Booking Status", "Payment Status"],
    bookings.map((b) => [
      b.bookingReference,
      b.userName,
      b.userEmail,
      b.eventTitle,
      formatDate(b.createdAt),
      b.total.toFixed(2),
      b.bookingStatus,
      b.paymentStatus,
    ])
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bookings-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});
