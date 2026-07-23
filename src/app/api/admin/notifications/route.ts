import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { getAdminNotifications } from "@/lib/admin/notifications";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await getAdminNotifications();
  return NextResponse.json(notifications);
}
