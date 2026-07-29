import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Booking from '@/models/Booking';
import ReservedSeat from '@/models/ReservedSeat';
import Event from '@/models/Event';

async function updateSeats(filter: Record<string, any>, update: Record<string, any>) {
  try {
    await mongoose.connection.db!.collection("seats").updateMany(filter, update, {
      bypassDocumentValidation: true,
    } as any);
  } catch {
    await mongoose.connection.db!.collection("seats").updateMany(filter, update);
  }
}

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

    const booking = await Booking.findById(bookingId).populate('eventId', 'eventDate');

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found.' }, { status: 404 });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return NextResponse.json({ message: 'Booking is already cancelled.' }, { status: 400 });
    }

    // Check if cancellation is on the same day as the event
    const event = booking.eventId as unknown as { eventDate?: Date };
    let refundAmount = booking.total;
    let penalty = 0;

    if (event?.eventDate) {
      const eventDate = new Date(event.eventDate);
      const today = new Date();
      const isSameDay =
        eventDate.getFullYear() === today.getFullYear() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getDate() === today.getDate();

      if (isSameDay) {
        penalty = booking.total * 0.5;
        refundAmount = booking.total - penalty;
      }
    }

    // Free the reserved seats back to AVAILABLE
    const reservedSeats = await ReservedSeat.find({ bookingId: new mongoose.Types.ObjectId(bookingId) });
    const seatIds = reservedSeats.map((rs) => rs.seatId);
    if (seatIds.length > 0) {
      await updateSeats({ _id: { $in: seatIds } }, { $set: { status: 'AVAILABLE' } });
    }

    await ReservedSeat.deleteMany({ bookingId: new mongoose.Types.ObjectId(bookingId) });

    booking.bookingStatus = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    await booking.save();

    return NextResponse.json(
      {
        success: true,
        message: penalty > 0
          ? `Booking cancelled. A 50% same-day cancellation fee ($${penalty.toFixed(2)}) applies. $${refundAmount.toFixed(2)} will be refunded.`
          : 'Booking cancelled successfully. Full refund processed.',
        booking: {
          _id: booking._id.toString(),
          bookingReference: booking.bookingReference,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          refundAmount,
          penalty,
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
