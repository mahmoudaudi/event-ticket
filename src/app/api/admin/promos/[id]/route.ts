import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import PromoCode from "@/models/PromoCode";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid promo code ID" }, { status: 400 });
  }
  try {
    await connectDB();
    const promo = await PromoCode.findById(id).lean();
    if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...promo, _id: promo._id.toString() });
  } catch {
    return NextResponse.json({ error: "Failed to fetch promo code" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid promo code ID" }, { status: 400 });
  }
  try {
    const body = await req.json();
    await connectDB();

    const update: Record<string, unknown> = {};
    if (body.code) update.code = body.code.toUpperCase().trim();
    if (body.description !== undefined) update.description = body.description;
    if (body.discountType) update.discountType = body.discountType;
    if (body.discountValue !== undefined) update.discountValue = body.discountValue;
    if (body.minimumPurchase !== undefined) update.minimumPurchase = body.minimumPurchase;
    if (body.maxUsage !== undefined) update.maxUsage = body.maxUsage;
    if (body.expiresAt !== undefined) update.expiresAt = body.expiresAt || null;
    if (body.isActive !== undefined) update.isActive = body.isActive;

    const promo = await PromoCode.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ...promo.toObject(), _id: promo._id.toString() });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "A promo code with this name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || "Failed to update promo code" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid promo code ID" }, { status: 400 });
  }
  try {
    await connectDB();
    const promo = await PromoCode.findByIdAndDelete(id);
    if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
  }
}
