import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);
