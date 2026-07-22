import { NextResponse } from 'next/server';
import { connectDB } from '@/lib';
import Event from '@/models/Event';
import Seat from '@/models/Seat';

export async function GET() {
  try {
    await connectDB();

    let event = await Event.findOne({ title: 'Neon Nights Live' }).lean();

    if (!event) {
      const fallbackUserId = '000000000000000000000000';
      event = await Event.create({
        title: 'Neon Nights Live',
        description: 'A futuristic live concert with immersive lighting and premium lounge seating.',
        categoryId: '000000000000000000000000',
        venue: 'Aurora Hall',
        address: '180 Sky Avenue',
        city: 'Seattle',
        eventDate: new Date('2026-09-18T20:00:00Z'),
        startTime: '8:00 PM',
        endTime: '11:00 PM',
        organizer: 'Northstar Events',
        bannerImage: '/images/banner.jpg',
        status: 'PUBLISHED',
        createdBy: fallbackUserId,
      });
    }

    const existingSeats = await Seat.find({ eventId: event._id }).lean();

    if (existingSeats.length === 0) {
      const seatTemplates = [
        { section: 'Floor', row: 'A', seatNumber: '1', price: 89 },
        { section: 'Floor', row: 'A', seatNumber: '2', price: 89 },
        { section: 'Floor', row: 'A', seatNumber: '3', price: 89 },
        { section: 'Floor', row: 'A', seatNumber: '4', price: 89 },
        { section: 'Floor', row: 'B', seatNumber: '1', price: 92 },
        { section: 'Floor', row: 'B', seatNumber: '2', price: 92 },
        { section: 'Floor', row: 'B', seatNumber: '3', price: 92 },
        { section: 'Floor', row: 'B', seatNumber: '4', price: 92 },
        { section: 'Balcony', row: 'C', seatNumber: '1', price: 64 },
        { section: 'Balcony', row: 'C', seatNumber: '2', price: 64 },
        { section: 'Balcony', row: 'C', seatNumber: '3', price: 64 },
        { section: 'Balcony', row: 'C', seatNumber: '4', price: 64 },
        { section: 'Balcony', row: 'D', seatNumber: '1', price: 58 },
        { section: 'Balcony', row: 'D', seatNumber: '2', price: 58 },
        { section: 'Balcony', row: 'D', seatNumber: '3', price: 58 },
        { section: 'Balcony', row: 'D', seatNumber: '4', price: 58 },
      ];

      const seatsToCreate = seatTemplates.map((template, index) => ({
        eventId: event._id,
        section: template.section,
        row: template.row,
        seatNumber: template.seatNumber,
        status: index % 5 === 0 ? 'RESERVED' : 'AVAILABLE',
        price: template.price,
      }));

      await Seat.create(seatsToCreate);
    }

    const seats = await Seat.find({ eventId: event._id }).sort({ section: 1, row: 1, seatNumber: 1 }).lean();

    return NextResponse.json({
      event: {
        _id: event._id.toString(),
        title: event.title,
        venue: event.venue,
        eventDate: event.eventDate,
        startTime: event.startTime,
        endTime: event.endTime,
      },
      seats: seats.map((seat) => ({
        _id: seat._id.toString(),
        section: seat.section,
        row: seat.row,
        seatNumber: seat.seatNumber,
        status: seat.status,
        price: seat.price ?? 60,
      })),
    });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
