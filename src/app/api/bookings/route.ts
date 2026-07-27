import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import ReservedSeat from '@/models/ReservedSeat';
import Seat from '@/models/Seat';
import { requireUser } from '@/lib/guards';

/**
 * POST /api/bookings
 * Creates a new booking record with reserved seats for the signed-in user.
 *
 * Expected request body:
 * {
 *   eventId: string (MongoDB ObjectId),
 *   seatIds: string[] (MongoDB ObjectIds),
 *   tickets: [
 *     {
 *       ticketTypeId: string,
 *       quantity: number,
 *       unitPrice: number,
 *       totalPrice: number
 *     }
 *   ],
 *   subtotal: number,
 *   discount: number,
 *   total: number,
 *   promoCodeId?: string (MongoDB ObjectId, optional)
 * }
 */
export async function POST(request: Request) {
  try {
    const session = await requireUser();
    if (!session?.user) {
      return NextResponse.json({ message: 'You must be signed in to book tickets.' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();

    const {
      eventId,
      seatIds,
      tickets,
      subtotal,
      discount,
      total,
      promoCodeId,
    } = body;

    // Validate required fields
    if (!eventId || typeof eventId !== 'string') {
      return NextResponse.json(
        { message: 'eventId is required and must be a valid string (MongoDB ObjectId).' },
        { status: 400 }
      );
    }

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { message: 'seatIds is required and must be a non-empty array of MongoDB ObjectIds.' },
        { status: 400 }
      );
    }

    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
      return NextResponse.json(
        { message: 'tickets array is required and must not be empty.' },
        { status: 400 }
      );
    }

    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json(
        { message: 'total is required and must be a positive number.' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: 'userId must be a valid MongoDB ObjectId.' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { message: 'eventId must be a valid MongoDB ObjectId.' },
        { status: 400 }
      );
    }

    for (const seatId of seatIds) {
      if (!mongoose.Types.ObjectId.isValid(seatId)) {
        return NextResponse.json(
          { message: `Invalid seat ID format: ${seatId}. All seatIds must be valid MongoDB ObjectIds.` },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const seatObjectIds = seatIds.map((id) => new mongoose.Types.ObjectId(id));

    // Atomically check all seats are available and mark them as BOOKED
    const alreadyBooked = await Seat.countDocuments({
      _id: { $in: seatObjectIds },
      status: 'BOOKED',
    });

    if (alreadyBooked > 0) {
      return NextResponse.json(
        { message: 'Some selected seats are already booked. Please go back and choose different seats.' },
        { status: 409 }
      );
    }

    await Seat.updateMany(
      { _id: { $in: seatObjectIds } },
      { $set: { status: 'BOOKED' } }
    );

    // Generate unique booking reference
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const bookingReference = `EP-${timestamp.toString().slice(-4)}-${random}`;

    // Create booking with validated real data. `qrCode` stores the raw
    // content to encode, not an image — the e-ticket page renders it as a
    // scannable SVG on demand via generateQrCodeSvg() (see src/lib/qrcode.ts).
    const booking = await Booking.create({
      bookingReference,
      userId: new mongoose.Types.ObjectId(userId),
      eventId: new mongoose.Types.ObjectId(eventId),
      tickets,
      promoCodeId: promoCodeId ? new mongoose.Types.ObjectId(promoCodeId) : undefined,
      subtotal: subtotal || total,
      discount: discount || 0,
      total,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      qrCode: bookingReference,
    });

    // Create reserved seat records
    await ReservedSeat.insertMany(
      seatObjectIds.map((seatId) => ({
        bookingId: booking._id,
        seatId,
      }))
    );

    return NextResponse.json(
      {
        success: true,
        booking: {
          _id: booking._id.toString(),
          bookingReference: booking.bookingReference,
          total: booking.total,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.bookingStatus,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
