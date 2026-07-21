import mongoose from "mongoose";

const promoSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    description: String,
    discountType: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
    discountValue: { type: Number, required: true },
    minimumPurchase: Number,
    maxUsage: Number,
    usedCount: { type: Number, default: 0 },
    expiresAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.PromoCode || mongoose.model("PromoCode", promoSchema);
