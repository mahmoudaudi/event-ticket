import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { sendResetEmail, sendOTPEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email, method } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
    }

    if (method === "otp") {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.resetOTP = otp;
      user.resetOTPExpiry = new Date(Date.now() + 2 * 60 * 1000);
      await user.save();
      await sendOTPEmail(email, otp);
    } else {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = token;
      user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      await sendResetEmail(email, token);
    }

    return NextResponse.json({ message: "Instructions sent to your email." });
  } catch (err: any) {
    console.error("Forgot password error:", err?.message || err);
    const msg = err?.code === "EAUTH" ? "Email service authentication failed. Check SMTP settings." :
                err?.code === "ESOCKET" ? "Could not connect to email server." :
                "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
