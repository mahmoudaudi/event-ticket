import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { z } from "zod";

const schema = z.object({
  lat: z.number(),
  lng: z.number(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
    }

    await connectDB();
    await Event.findByIdAndUpdate(id, { lat: parsed.data.lat, lng: parsed.data.lng });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save coordinates" }, { status: 500 });
  }
}
