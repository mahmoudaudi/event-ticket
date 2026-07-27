import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import ReservedSeat from '@/models/ReservedSeat';
import Seat from '@/models/Seat';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;

    if (!bookingId) {
      return NextResponse.json({ message: 'Booking ID is required.' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return NextResponse.json({ message: 'Invalid booking ID.' }, { status: 400 });
    }

    await connectDB();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found.' }, { status: 404 });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return NextResponse.json({ message: 'Booking is already cancelled.' }, { status: 400 });
    }

    // Free the reserved seats back to AVAILABLE
    const reservedSeats = await ReservedSeat.find({ bookingId: new mongoose.Types.ObjectId(bookingId) });
    const seatIds = reservedSeats.map((rs) => rs.seatId);
    if (seatIds.length > 0) {
      await Seat.updateMany(
        { _id: { $in: seatIds } },
        { $set: { status: 'AVAILABLE' } }
      );
    }

    // Delete reserved seat records
    await ReservedSeat.deleteMany({ bookingId: new mongoose.Types.ObjectId(bookingId) });

    // Update booking status and mark payment as refunded
    booking.bookingStatus = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    await booking.save();

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
