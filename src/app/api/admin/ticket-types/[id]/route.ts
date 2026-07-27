import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { updateTicketType, deleteTicketType } from "@/lib/admin/events";
import { ticketTypeInputSchema } from "@/lib/validation/event";
import { withErrorLogging } from "@/lib/withErrorLogging";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const PATCH = withErrorLogging(async (request: Request, { params }: RouteParams) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = ticketTypeInputSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await updateTicketType(id, parsed.data);
  return NextResponse.json({ success: true });
});

export const DELETE = withErrorLogging(async (_request: Request, { params }: RouteParams) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteTicketType(id);
  return NextResponse.json({ success: true });
});
