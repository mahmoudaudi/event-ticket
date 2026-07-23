import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { duplicateAdminEvent } from "@/lib/admin/events";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const newId = await duplicateAdminEvent(id, session.user.id);
  if (!newId) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  return NextResponse.json({ id: newId }, { status: 201 });
}
