import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, TicketType, Booking } from "@/models";
import { geocodeAddress } from "@/lib/geocode";

async function enrichEvents(events: any[]) {
  // Lazy-geocode events missing coordinates (existing pre-feature events)
  for (const ev of events) {
    if (!ev.lat && !ev.lng && (ev.venue || ev.city)) {
      const addr = [ev.venue, ev.address, ev.city].filter(Boolean).join(", ");
      const coords = await geocodeAddress(addr);
      if (coords) {
        await Event.findByIdAndUpdate(ev._id, { lat: coords.lat, lng: coords.lng });
        ev.lat = coords.lat;
        ev.lng = coords.lng;
      }
    }
  }

  return Promise.all(
    events.map(async (ev: any) => {
      const ticketTypes = (await TicketType.find({ eventId: ev._id })
        .sort({ price: 1 })
        .limit(1)
        .lean()) as any[];
      return {
        _id: ev._id.toString(),
        title: ev.title,
        description: ev.description,
        category: (ev.categoryId as any)?.name || "General",
        date: ev.eventDate
          ? `${new Date(ev.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase()} • ${ev.startTime || "00:00"}`
          : "",
        location: [ev.city, ev.address].filter(Boolean).join(", ") || ev.venue || "TBD",
        price: ticketTypes[0]?.price ?? 0,
        img: ev.bannerImage || "",
        lat: ev.lat ?? null,
        lng: ev.lng ?? null,
      };
    })
  );
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const featured = searchParams.get("featured") === "true";
    const popular = searchParams.get("popular") === "true";
    const upcoming = searchParams.get("upcoming") === "true";
    const all = searchParams.get("all") === "true";

    const populate = { path: "categoryId", select: "name" } as const;
    const sort = { eventDate: 1 } as const;

    if (popular) {
      const popularIds = (await Booking.aggregate([
        { $match: { bookingStatus: "CONFIRMED" } },
        { $unwind: "$tickets" },
        { $group: { _id: "$eventId", totalTickets: { $sum: "$tickets.quantity" } } },
        { $sort: { totalTickets: -1 } },
        { $limit: 10 },
      ])) as { _id: any; totalTickets: number }[];

      let popularEvents: any[] = [];
      if (popularIds.length > 0) {
        const ids = popularIds.map((p) => p._id);
        popularEvents = (await Event.find({ _id: { $in: ids } }).populate(populate).lean()) as any[];
        const idOrder = ids.map((id) => id.toString());
        popularEvents.sort((a, b) => idOrder.indexOf(a._id.toString()) - idOrder.indexOf(b._id.toString()));
      }
      if (popularEvents.length === 0) {
        popularEvents = (await Event.find({}).populate(populate).sort(sort).lean()) as any[];
      }
      return NextResponse.json({ events: await enrichEvents(popularEvents) });
    }

    let filter: Record<string, any> = {};
    if (featured) filter.isFeatured = true;
    if (upcoming) filter.eventDate = { $gte: new Date() };

    const query = Event.find(filter).populate(populate).sort(sort);
    if (!all) query.limit(8);
    const events = (await query.lean()) as any[];
    return NextResponse.json({ events: await enrichEvents(events) });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
