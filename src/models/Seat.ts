import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
  eventId: { type: mongoose.Types.ObjectId, ref: "Event", required: true },
  section: { type: String, required: true },
  row: { type: String, required: true },
  seatNumber: { type: String, required: true },
  status: { type: String, enum: ["AVAILABLE", "RESERVED"], default: "AVAILABLE" },
  price: { type: Number, required: true, default: 60 },
});

seatSchema.index({ eventId: 1, section: 1, row: 1, seatNumber: 1 }, { unique: true });

export default mongoose.models.Seat || mongoose.model("Seat", seatSchema);
