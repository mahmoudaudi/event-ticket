import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Types.ObjectId, ref: "Booking", required: true, unique: true },
    paymentMethod: { type: String, enum: ["CARD", "CASH", "MOCK"], required: true },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
    amount: { type: Number, required: true },
    transactionReference: String,
    paidAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
