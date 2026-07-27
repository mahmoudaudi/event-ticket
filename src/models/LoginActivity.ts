import mongoose from "mongoose";

const loginActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User" }, // absent when the email didn't match any account
    email: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ["USER", "ADMIN"] },
    success: { type: Boolean, required: true },
    reason: { type: String }, // set when success is false, e.g. "invalid_password", "unknown_email", "inactive_account"
  },
  { timestamps: true }
);

loginActivitySchema.index({ createdAt: -1 });

export default mongoose.models.LoginActivity || mongoose.model("LoginActivity", loginActivitySchema);
