import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PromoCode from "@/models/PromoCode";

export async function GET() {
  try {
    await connectDB();
    const promos = await PromoCode.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(promos.map((p: any) => ({ ...p, _id: p._id.toString() })));
  } catch {
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectDB();

    const promo = await PromoCode.create({
      code: (body.code || "").toUpperCase().trim(),
      description: body.description,
      discountType: body.discountType,
      discountValue: body.discountValue,
      minimumPurchase: body.minimumPurchase,
      maxUsage: body.maxUsage,
      expiresAt: body.expiresAt || null,
      isActive: body.isActive ?? true,
    });

    return NextResponse.json({ ...promo.toObject(), _id: promo._id.toString() }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "A promo code with this name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message || "Failed to create promo code" }, { status: 500 });
  }
}
