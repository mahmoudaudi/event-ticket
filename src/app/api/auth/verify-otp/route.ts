import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpiry: { $gt: new Date() },
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
