import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { createTicketType } from "@/lib/admin/events";
import { ticketTypeInputSchema } from "@/lib/validation/event";
import { withErrorLogging } from "@/lib/withErrorLogging";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const POST = withErrorLogging(async (request: Request, { params }: RouteParams) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = ticketTypeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ticketTypeId = await createTicketType(id, parsed.data);
  return NextResponse.json({ id: ticketTypeId }, { status: 201 });
});
