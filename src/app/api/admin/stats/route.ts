import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { getDashboardStats, DASHBOARD_RANGE_OPTIONS, type DashboardRangeDays } from "@/lib/admin/stats";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const requestedRange = Number(searchParams.get("range") ?? "30");
  const range = (DASHBOARD_RANGE_OPTIONS as readonly number[]).includes(requestedRange)
    ? (requestedRange as DashboardRangeDays)
    : 30;

  const stats = await getDashboardStats(range);
  return NextResponse.json(stats);
}
