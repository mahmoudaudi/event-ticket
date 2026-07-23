import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { getAdminActivityList } from "@/lib/admin/activity";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");

  const result = await getAdminActivityList(page);
  return NextResponse.json(result);
}
