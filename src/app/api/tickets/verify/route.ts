import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import "@/models/Event";
import "@/models/User";

export async function GET(req: NextRequest) {
  try {
    let code = req.nextUrl.searchParams.get("code") || "";
    if (!code) {
      return NextResponse.json({ valid: false, message: "Missing ticket code" }, { status: 400 });
    }

    // Extract booking reference from full URL if present
    const urlMatch = code.match(/\/bookings\/([^/]+)/);
    if (urlMatch) {
      code = urlMatch[1];
    }

    await connectDB();

    let booking;
    if (mongoose.Types.ObjectId.isValid(code)) {
      booking = await Booking.findById(code)
        .populate("eventId", "title eventDate venue city startTime bannerImage")
        .populate("userId", "firstName lastName email")
        .lean();
    }

    if (!booking) {
      booking = await Booking.findOne({ bookingReference: code })
        .populate("eventId", "title eventDate venue city startTime bannerImage")
        .populate("userId", "firstName lastName email")
        .lean();
    }

    if (!booking) {
      return NextResponse.json({ valid: false, message: "Invalid ticket" }, { status: 404 });
    }

    if (booking.bookingStatus === "CANCELLED") {
      return NextResponse.json({ valid: false, message: "This ticket has been cancelled" }, { status: 410 });
    }

    return NextResponse.json({
      valid: true,
      booking: {
        bookingReference: booking.bookingReference,
        bookingStatus: booking.bookingStatus,
        paymentStatus: booking.paymentStatus,
        eventTitle: (booking.eventId as any)?.title,
        eventDate: (booking.eventId as any)?.eventDate,
        venue: (booking.eventId as any)?.venue,
        city: (booking.eventId as any)?.city,
        startTime: (booking.eventId as any)?.startTime,
        customerName: `${(booking.userId as any)?.firstName} ${(booking.userId as any)?.lastName}`,
        customerEmail: (booking.userId as any)?.email,
      },
    });
  } catch (error) {
    console.error("Ticket verification error:", error);
    return NextResponse.json({ valid: false, message: "Internal error" }, { status: 500 });
  }
}
