import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PromoCode from "@/models/PromoCode";

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code");
    if (!code || !code.trim()) {
      return NextResponse.json({ valid: false, message: "Code is required" }, { status: 400 });
    }

    await connectDB();

    const promo = await PromoCode.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gte: new Date() } },
      ],
    });

    if (!promo) {
      return NextResponse.json({ valid: false, message: "Invalid or expired promo code" });
    }

    if (promo.maxUsage && promo.usedCount >= promo.maxUsage) {
      return NextResponse.json({ valid: false, message: "This promo code has reached its usage limit" });
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      minimumPurchase: promo.minimumPurchase,
      description: promo.description,
      _id: promo._id.toString(),
    });
  } catch (error) {
    console.error("Promo code validation error:", error);
    return NextResponse.json({ valid: false, message: "Internal error" }, { status: 500 });
  }
}
