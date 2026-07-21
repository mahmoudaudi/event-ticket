import mongoose from "mongoose";

const ticketTypeSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Types.ObjectId, ref: "Event", required: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    capacity: { type: Number, required: true },
    remainingSeats: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.TicketType || mongoose.model("TicketType", ticketTypeSchema);
