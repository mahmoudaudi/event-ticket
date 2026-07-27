import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { fulfillBookingFromStripeSession, releaseReservedSeats } from '@/lib/bookingFulfillment';

/**
 * POST /api/webhooks/stripe
 * Production safety net for the checkout flow: the success page in
 * /api/checkout/confirm handles the common case (buyer's browser makes it
 * back to our site), but if they close the tab mid-redirect, this is what
 * actually confirms the booking. Also releases seat holds when a session
 * expires without being paid.
 *
 * In dev, forward events here with: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ message: 'Webhook not configured.' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return NextResponse.json({ message: 'Invalid signature.' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      if (checkoutSession.payment_status === 'paid') {
        const md = checkoutSession.metadata;
        if (md?.userId && md?.eventId && md?.seatIds) {
          const quantity = Number(md.quantity) || 1;
          const subtotal = Number(md.subtotal) || 0;
          const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

          await fulfillBookingFromStripeSession({
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
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      const seatIds = checkoutSession.metadata?.seatIds?.split(',') ?? [];
      if (seatIds.length > 0) {
        await releaseReservedSeats(seatIds);
      }
    }
  } catch (error) {
    console.error('Error handling Stripe webhook event:', error);
    // Return 200 anyway once signature is verified — Stripe will otherwise
    // retry, and a DB error here isn't something a retry alone fixes.
  }

  return NextResponse.json({ received: true });
}
