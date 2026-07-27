import mongoose from "mongoose";

const adminActivitySchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    adminName: { type: String, required: true },
    action: {
      type: String,
      enum: ["BOOKING_CONFIRMED", "BOOKING_CANCELLED", "USER_ROLE_CHANGED", "USER_SUSPENDED", "USER_REACTIVATED"],
      required: true,
    },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

adminActivitySchema.index({ createdAt: -1 });

export default mongoose.models.AdminActivity || mongoose.model("AdminActivity", adminActivitySchema);
