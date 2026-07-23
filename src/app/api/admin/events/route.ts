import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { getAdminEventsList, createAdminEvent } from "@/lib/admin/events";
import { eventInputSchema } from "@/lib/validation/event";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? undefined;
  const status = searchParams.get("status") ?? undefined;

  const result = await getAdminEventsList({ page, search, status });
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = eventInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const id = await createAdminEvent(parsed.data, session.user.id);
  return NextResponse.json({ id }, { status: 201 });
}
