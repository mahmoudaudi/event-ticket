import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import ReservedSeat from '@/models/ReservedSeat';

/**
 * PATCH /api/bookings/[bookingId]/cancel
 * Cancels an existing booking and releases all reserved seats
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json(
        { message: 'Booking ID is required.' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { message: 'Invalid booking ID.' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found.' },
        { status: 404 }
      );
    }

    // Check if already cancelled
    if (booking.bookingStatus === 'CANCELLED') {
      return NextResponse.json(
        { message: 'Booking is already cancelled.' },
        { status: 400 }
      );
    }

    // Update booking status to CANCELLED
    booking.bookingStatus = 'CANCELLED';
    await booking.save();

    // Delete all reserved seats for this booking
    await ReservedSeat.deleteMany({ bookingId: new mongoose.Types.ObjectId(bookingId) });

    // Return clean response
    return NextResponse.json(
      {
        success: true,
        message: 'Booking cancelled successfully.',
        booking: {
          _id: booking._id.toString(),
          bookingReference: booking.bookingReference,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
