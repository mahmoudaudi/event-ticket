import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import Seat from '@/models/Seat';

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;

    if (!eventId) {
      return NextResponse.json({ message: 'Event ID is required.' }, { status: 400 });
    }

    await connectDB();

    const event = await Event.findById(eventId).lean();

    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    const seats = await Seat.find({ eventId: new mongoose.Types.ObjectId(eventId) })
      .sort({ row: 1, seatNumber: 1 })
      .lean();

    return NextResponse.json({
      event: {
        _id: String(event._id),
        title: event.title,
        venue: event.venue,
        eventDate: event.eventDate,
        startTime: event.startTime,
        endTime: event.endTime,
      },
      seats: seats.map((seat) => ({
        _id: String(seat._id),
        row: seat.row,
        section: seat.section,
        seatNumber: seat.seatNumber,
        status: seat.status,
        price: seat.price,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Unable to load seats.' }, { status: 500 });
  }
}
