import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import Event from '@/models/Event';
import ReservedSeat from '@/models/ReservedSeat';
import Seat from '@/models/Seat';
import User from '@/models/User';

/**
 * GET /api/bookings/[bookingId]
 * Fetches a complete booking with all related data
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json({ message: 'Booking ID is required.' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ message: 'Invalid booking ID.' }, { status: 400 });
    }

    await connectDB();

    // Fetch booking with user and event details
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'firstName lastName email')
      .populate('eventId', 'title description venue address city eventDate startTime endTime bannerImage')
      .populate('promoCodeId', 'code discount')
      .lean();

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found.' }, { status: 404 });
    }

    // Fetch reserved seats with seat details
    const reservedSeats = await ReservedSeat.find({ bookingId: new mongoose.Types.ObjectId(bookingId) })
      .populate('seatId', 'section row seatNumber price')
      .lean();

    // Format response
    const formattedBooking = {
      _id: booking._id.toString(),
      bookingReference: booking.bookingReference,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      total: booking.total,
      subtotal: booking.subtotal,
      discount: booking.discount,
      qrCode: booking.qrCode,
      createdAt: booking.createdAt,
      user: booking.userId
        ? {
            _id: (booking.userId as any)._id.toString(),
            firstName: (booking.userId as any).firstName,
            lastName: (booking.userId as any).lastName,
            email: (booking.userId as any).email,
          }
        : null,
      event: booking.eventId
        ? {
            _id: (booking.eventId as any)._id.toString(),
            title: (booking.eventId as any).title,
            venue: (booking.eventId as any).venue,
            address: (booking.eventId as any).address,
            city: (booking.eventId as any).city,
            eventDate: (booking.eventId as any).eventDate,
            startTime: (booking.eventId as any).startTime,
            endTime: (booking.eventId as any).endTime,
            bannerImage: (booking.eventId as any).bannerImage,
          }
        : null,
      tickets: booking.tickets,
      reservedSeats: reservedSeats.map((rs) => ({
        _id: rs._id.toString(),
        seatId: (rs.seatId as any)._id.toString(),
        section: (rs.seatId as any).section,
        row: (rs.seatId as any).row,
        seatNumber: (rs.seatId as any).seatNumber,
        price: (rs.seatId as any).price,
      })),
      promoCode: booking.promoCodeId
        ? {
            code: (booking.promoCodeId as any).code,
            discount: (booking.promoCodeId as any).discount,
          }
        : null,
    };

    return NextResponse.json(formattedBooking, { status: 200 });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
