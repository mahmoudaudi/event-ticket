import mongoose from "mongoose";

const reservedSeatSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Types.ObjectId, ref: "Booking", required: true },
  seatId: { type: mongoose.Types.ObjectId, ref: "Seat", required: true },
});

reservedSeatSchema.index({ bookingId: 1 });
reservedSeatSchema.index({ seatId: 1 });

export default mongoose.models.ReservedSeat || mongoose.model("ReservedSeat", reservedSeatSchema);
