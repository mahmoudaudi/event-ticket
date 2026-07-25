import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { User } from "@/models";

const JWT_SECRET = process.env.JWT_SECRET || "event-premium-secret-key-change-in-production-2026";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { firstName, lastName, profileImage } = await req.json();

    await connectDB();
    const updated = await User.findByIdAndUpdate(
      decoded.userId,
      { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(profileImage !== undefined && { profileImage }) },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: { firstName: updated.firstName, lastName: updated.lastName, email: updated.email, profileImage: updated.profileImage },
    });
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
