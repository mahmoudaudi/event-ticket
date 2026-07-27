import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Event from '@/models/Event';
import Seat from '@/models/Seat';
import { requireUser } from '@/lib/guards';
import { stripe } from '@/lib/stripe';

/**
 * POST /api/checkout/create-session
 * Holds the selected seats (marks them RESERVED so nobody else can grab
 * them mid-payment) and creates a Stripe Checkout Session for the order
 * total. The actual Booking is only created once Stripe confirms payment —
 * see /api/checkout/confirm and /api/webhooks/stripe.
 */
export async function POST(request: Request) {
  try {
    const session = await requireUser();
    if (!session?.user) {
      return NextResponse.json({ message: 'You must be signed in to book tickets.' }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { eventId, seatIds, subtotal, discount, total, promoCodeId, customerEmail } = body;

    if (!eventId || typeof eventId !== 'string' || !mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json({ message: 'A valid eventId is required.' }, { status: 400 });
    }
    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json({ message: 'seatIds is required and must be a non-empty array.' }, { status: 400 });
    }
    for (const seatId of seatIds) {
      if (!mongoose.Types.ObjectId.isValid(seatId)) {
        return NextResponse.json({ message: `Invalid seat ID format: ${seatId}.` }, { status: 400 });
      }
    }
    if (typeof total !== 'number' || total <= 0.5) {
      return NextResponse.json({ message: 'Order total must be greater than $0.50.' }, { status: 400 });
    }

    await connectDB();

    const event = await Event.findById(eventId).lean();
    if (!event) {
      return NextResponse.json({ message: 'Event not found.' }, { status: 404 });
    }

    const seatObjectIds = seatIds.map((id: string) => new mongoose.Types.ObjectId(id));
    const seats = await Seat.find({ _id: { $in: seatObjectIds } }).lean();
    if (seats.length !== seatIds.length) {
      return NextResponse.json({ message: 'One or more selected seats could not be found.' }, { status: 400 });
    }
    if (seats.some((s) => s.status !== 'AVAILABLE')) {
      return NextResponse.json(
        { message: 'One or more selected seats are no longer available. Please go back and choose different seats.' },
        { status: 409 }
      );
    }

    // Hold the seats for the lifetime of the Checkout Session so nobody else
    // can book them while this buyer is entering payment details.
    await Seat.updateMany({ _id: { $in: seatObjectIds } }, { $set: { status: 'RESERVED' } });

    const origin = request.headers.get('origin') || `https://${request.headers.get('host') || 'localhost:3000'}`;
    const expiresInSeconds = 30 * 60; // 30 minutes to complete payment

    let checkoutSession;
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: typeof customerEmail === 'string' ? customerEmail : undefined,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(total * 100),
              product_data: {
                name: `${event.title} — ${seats.length} ticket${seats.length > 1 ? 's' : ''}`,
                description: seats
                  .map((s) => `${s.section} Row ${s.row} Seat ${s.seatNumber}`)
                  .join(', '),
              },
            },
            quantity: 1,
          },
        ],
        expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?cancelled=1`,
        metadata: {
          userId,
          eventId,
          seatIds: seatIds.join(','),
          quantity: String(seats.length),
          subtotal: String(subtotal ?? total),
          discount: String(discount ?? 0),
          total: String(total),
          promoCodeId: promoCodeId ? String(promoCodeId) : '',
        },
      });
    } catch (stripeError) {
      // Release the hold if Stripe session creation itself failed.
      await Seat.updateMany({ _id: { $in: seatObjectIds } }, { $set: { status: 'AVAILABLE' } });
      throw stripeError;
    }

    return NextResponse.json({ url: checkoutSession.url, sessionId: checkoutSession.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
