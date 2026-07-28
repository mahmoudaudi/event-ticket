import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { withErrorLogging } from "@/lib/withErrorLogging";
import { connectDB } from "@/lib/db";
import Seat from "@/models/Seat";
import { z } from "zod";

const createSeatsSchema = z.object({
  sections: z.array(
    z.object({
      name: z.string().min(1),
      rows: z.array(z.string().min(1)).min(1),
      seatsPerRow: z.number().int().min(1),
      price: z.number().min(0),
    })
  ).min(1),
});

export const POST = withErrorLogging(async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = createSeatsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectDB();

  // Clear existing seats for this event
  await Seat.deleteMany({ eventId: id });

  const seats: Record<string, any>[] = [];
  for (const section of parsed.data.sections) {
    for (const row of section.rows) {
      for (let n = 1; n <= section.seatsPerRow; n++) {
        seats.push({
          eventId: id,
          section: section.name,
          row,
          seatNumber: String(n),
          status: "AVAILABLE",
          price: section.price,
        });
      }
    }
  }

  await Seat.insertMany(seats);

  return NextResponse.json({ count: seats.length }, { status: 201 });
});

export const GET = withErrorLogging(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const seats = await Seat.find({ eventId: id }).sort({ section: 1, row: 1, seatNumber: 1 }).lean();

  return NextResponse.json({ seats });
});

export const DELETE = withErrorLogging(async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  await Seat.deleteMany({ eventId: id });

  return NextResponse.json({ success: true });
});
