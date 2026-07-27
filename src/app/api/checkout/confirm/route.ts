import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/guards';
import { stripe } from '@/lib/stripe';
import { fulfillBookingFromStripeSession } from '@/lib/bookingFulfillment';

/**
 * POST /api/checkout/confirm
 * Called from the /checkout/success page right after Stripe redirects back.
 * Verifies the session was actually paid, then creates the booking.
 * Idempotent: if the webhook already created the booking for this session
 * (e.g. it arrived first), this just returns the existing one.
 */
export async function POST(request: Request) {
  try {
    const session = await requireUser();
    if (!session?.user) {
      return NextResponse.json({ message: 'You must be signed in.' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ message: 'sessionId is required.' }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ message: 'Payment has not completed yet.' }, { status: 402 });
    }

    const md = checkoutSession.metadata;
    if (!md?.userId || !md?.eventId || !md?.seatIds) {
      return NextResponse.json({ message: 'Checkout session is missing booking details.' }, { status: 500 });
    }

    // Defense-in-depth: the session's own userId must match whoever is confirming it.
    if (md.userId !== session.user.id) {
      return NextResponse.json({ message: 'This checkout session does not belong to you.' }, { status: 403 });
    }

    const origin = request.headers.get('origin') || `https://${request.headers.get('host') || 'localhost:3000'}`;
    const quantity = Number(md.quantity) || 1;
    const subtotal = Number(md.subtotal) || 0;

    const booking = await fulfillBookingFromStripeSession({
      userId: md.userId,
      eventId: md.eventId,
      seatIds: md.seatIds.split(','),
      tickets: [
        {
          ticketTypeId: md.eventId,
          quantity,
          unitPrice: subtotal / quantity,
          totalPrice: subtotal,
        },
      ],
      subtotal,
      discount: Number(md.discount) || 0,
      total: Number(md.total) || 0,
      promoCodeId: md.promoCodeId || undefined,
      stripeSessionId: checkoutSession.id,
      origin,
    });

    return NextResponse.json({ bookingId: booking._id.toString() });
  } catch (error) {
    console.error('Error confirming Stripe checkout session:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
