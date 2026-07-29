import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    categoryId: { type: mongoose.Types.ObjectId, ref: "Category", required: true },
    venue: String,
    address: String,
    city: String,
    eventDate: { type: Date, required: true },
    startTime: String,
    endTime: String,
    organizer: String,
    bannerImage: String,
    images: [String],
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "CANCELLED"], default: "DRAFT" },
    isFeatured: { type: Boolean, default: false },
    lat: Number,
    lng: Number,
    createdBy: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
