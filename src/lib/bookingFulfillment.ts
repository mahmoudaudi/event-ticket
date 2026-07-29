import "server-only";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Booking from "@/models/Booking";
import ReservedSeat from "@/models/ReservedSeat";

async function updateSeats(filter: Record<string, any>, update: Record<string, any>) {
  try {
    await mongoose.connection.db!.collection("seats").updateMany(filter, update, {
      bypassDocumentValidation: true,
    } as any);
  } catch {
    await mongoose.connection.db!.collection("seats").updateMany(filter, update);
  }
}

export interface FulfillBookingInput {
  userId: string;
  eventId: string;
  seatIds: string[];
  tickets: Array<{ ticketTypeId: string; quantity: number; unitPrice: number; totalPrice: number }>;
  subtotal: number;
  discount: number;
  total: number;
  promoCodeId?: string;
  stripeSessionId: string;
  origin: string;
}

/**
 * Turns a paid Stripe Checkout Session into a confirmed Booking. Called from
 * both the success-page confirm endpoint and the Stripe webhook — whichever
 * gets there first wins, since a booking already exists for `stripeSessionId`
 * on the second call (the unique index on that field also guards against a
 * race between the two).
 */
export async function fulfillBookingFromStripeSession(input: FulfillBookingInput) {
  await connectDB();

  const existing = await Booking.findOne({ stripeSessionId: input.stripeSessionId });
  if (existing) return existing;

  const seatObjectIds = input.seatIds.map((id) => new mongoose.Types.ObjectId(id));

  const bookingReference = `EP-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

  let booking;
  try {
    booking = await Booking.create({
      bookingReference,
      userId: new mongoose.Types.ObjectId(input.userId),
      eventId: new mongoose.Types.ObjectId(input.eventId),
      tickets: input.tickets,
      promoCodeId: input.promoCodeId ? new mongoose.Types.ObjectId(input.promoCodeId) : undefined,
      subtotal: input.subtotal,
      discount: input.discount,
      total: input.total,
      paymentStatus: "PAID",
      bookingStatus: "CONFIRMED",
      qrCode: bookingReference,
      stripeSessionId: input.stripeSessionId,
    });
  } catch (error) {
    // Duplicate key on stripeSessionId means a concurrent call already created it.
    const alreadyCreated = await Booking.findOne({ stripeSessionId: input.stripeSessionId });
    if (alreadyCreated) return alreadyCreated;
    throw error;
  }

  booking.qrCode = `${input.origin}/bookings/${booking._id}`;
  await booking.save();

  await updateSeats({ _id: { $in: seatObjectIds } }, { $set: { status: "BOOKED" } });
  await ReservedSeat.insertMany(seatObjectIds.map((seatId) => ({ bookingId: booking._id, seatId })));

  return booking;
}

/** Releases seats held for a Checkout Session that expired or was abandoned. */
export async function releaseReservedSeats(seatIds: string[]) {
  await connectDB();
  const objectIds = seatIds.map((id) => new mongoose.Types.ObjectId(id));
  await updateSeats({ _id: { $in: objectIds }, status: "RESERVED" }, { $set: { status: "AVAILABLE" } });
}
