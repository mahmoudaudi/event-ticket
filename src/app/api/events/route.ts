import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, TicketType } from "@/models";

export async function GET() {
  try {
    await connectDB();

    const events = (await Event.find({ status: "PUBLISHED" })
      .populate<{ categoryId: { _id: string; name: string } }>("categoryId", "name")
      .sort({ eventDate: 1 })
      .lean()) as any[];

    const enriched = await Promise.all(
      events.map(async (ev) => {
        const ticketTypes = (await TicketType.find({ eventId: ev._id })
          .sort({ price: 1 })
          .limit(1)
          .lean()) as any[];
        const minPrice = ticketTypes[0]?.price ?? 0;

        const dateStr = ev.eventDate
          ? new Date(ev.eventDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }).toUpperCase()
          : "";

        return {
          _id: ev._id.toString(),
          title: ev.title,
          description: ev.description,
          category: (ev.categoryId as any)?.name || "General",
          date: `${dateStr} • ${ev.startTime || "00:00"}`,
          location: [ev.city, ev.address].filter(Boolean).join(", ") || ev.venue || "TBD",
          price: minPrice,
          img: ev.bannerImage || "",
        };
      })
    );

    return NextResponse.json({ events: enriched });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
