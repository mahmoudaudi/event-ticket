import mongoose from "mongoose";

const ticketItemSchema = new mongoose.Schema({
  ticketTypeId: { type: mongoose.Types.ObjectId, ref: "TicketType", required: true },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: { type: String, required: true, unique: true },
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Types.ObjectId, ref: "Event", required: true },
    tickets: [ticketItemSchema],
    promoCodeId: { type: mongoose.Types.ObjectId, ref: "PromoCode" },
    subtotal: Number,
    discount: Number,
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED", "REFUNDED"], default: "PENDING" },
    bookingStatus: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELLED"], default: "PENDING" },
    qrCode: String,
    createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
    // Set for bookings paid via Stripe Checkout; used to make webhook/confirm
    // handling idempotent (a session can be confirmed more than once).
    stripeSessionId: { type: String, index: true, sparse: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
