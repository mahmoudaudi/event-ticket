import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import Event from "@/models/Event";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET!) as { userId: string };
    await connectDB();

    const user = await User.findById(decoded.userId).select("firstName lastName email profileImage");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bookings = await Booking.find({ userId: decoded.userId, bookingStatus: { $ne: "CANCELLED" } })
      .populate("eventId", "title eventDate venue bannerImage")
      .sort({ createdAt: -1 })
      .lean();

    const totalSpent = bookings.reduce((sum: number, b: any) => sum + (b.total || 0), 0);
    const eventCount = bookings.length;
    const points = Math.min(eventCount * 100, 1000);
    const tier = eventCount >= 15 ? "Platinum" : eventCount >= 8 ? "Gold" : eventCount >= 3 ? "Silver" : "Bronze";

    const result = {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
      },
      membership: {
        tier,
        points,
        nextTier: tier === "Platinum" ? null : tier === "Gold" ? "Platinum" : tier === "Silver" ? "Gold" : "Silver",
        pointsToNext: tier === "Platinum" ? 0 : tier === "Gold" ? 1000 - points : tier === "Silver" ? 500 - points : 300 - points,
        totalEvents: eventCount,
        totalSpent,
      },
      bookings: bookings.map((b: any) => ({
        eventName: b.eventId?.title || "Unknown Event",
        date: b.eventId?.eventDate,
        venue: b.eventId?.venue,
        bannerImage: b.eventId?.bannerImage,
        status: b.bookingStatus,
        total: b.total,
        quantity: (b.tickets || []).reduce((s: number, t: any) => s + t.quantity, 0),
      })),
      tickets: bookings.flatMap((b: any) =>
        (b.tickets || []).map((t: any) => ({
          eventName: b.eventId?.title || "Unknown Event",
          date: b.eventId?.eventDate,
          price: t.unitPrice,
          quantity: t.quantity,
        }))
      ),
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Dashboard API error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
