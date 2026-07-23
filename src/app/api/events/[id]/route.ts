import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, TicketType } from "@/models";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const event = await Event.findById(id).populate("categoryId", "name").lean();
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const tickets = await TicketType.find({ eventId: id }).sort({ price: 1 }).lean();

    const ev = event as any;

    return NextResponse.json({
      event: {
        _id: ev._id.toString(),
        title: ev.title,
        description: ev.description,
        category: ev.categoryId?.name || "General",
        date: ev.eventDate
          ? new Date(ev.eventDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "TBD",
        time: `${ev.startTime || "00:00"} – ${ev.endTime || "00:00"}`,
        location: [ev.city, ev.address].filter(Boolean).join(", ") || ev.venue || "TBD",
        venue: ev.venue,
        organizer: ev.organizer,
        img: ev.bannerImage || "",
        tickets: tickets.map((t: any) => ({
          id: t._id.toString(),
          name: t.name,
          price: t.price,
          capacity: t.capacity,
          remaining: t.remainingSeats,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
