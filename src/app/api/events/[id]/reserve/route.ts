import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import Seat from '@/models/Seat';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();

    if (!body?.seatIds || !Array.isArray(body.seatIds) || body.seatIds.length === 0) {
      return NextResponse.json(
        { message: 'seatIds is required and must be a non-empty array.' },
        { status: 400 }
      );
    }

    const seatIds: string[] = body.seatIds;
    const { id: eventId } = await params;

    await connectDB();

    const event = await Event.findById(eventId).lean();

    if (!event) {
      return NextResponse.json({ message: 'Event not found' }, { status: 404 });
    }

    let objectIds: mongoose.Types.ObjectId[];

    try {
      objectIds = seatIds.map((id) => new mongoose.Types.ObjectId(id));
    } catch {
      return NextResponse.json({ message: 'Invalid seat IDs provided.' }, { status: 400 });
    }

    const availableSeatCount = await Seat.countDocuments({
  eventId: event._id,
  _id: { $in: objectIds },
  status: 'AVAILABLE',
});

if (availableSeatCount !== seatIds.length) {
  return NextResponse.json(
    { message: 'One or more selected seats are no longer available.' },
    { status: 409 }
  );
}
    const result = await Seat.updateMany(
      {
        eventId: event._id,
        _id: { $in: objectIds },
        status: 'AVAILABLE',
      },
      {
        status: 'RESERVED',
      }
    );

    if (result.modifiedCount !== seatIds.length) {
      return NextResponse.json({ message: 'Seat already reserved' }, { status: 409 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
  console.error(error);

  return NextResponse.json(
    { message: 'Internal server error' },
    { status: 500 }
  );
}
}
