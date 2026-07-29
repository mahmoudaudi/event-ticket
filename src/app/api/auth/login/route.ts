import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { logLoginAttempt } from "@/lib/admin/logins";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      await logLoginAttempt({ email, success: false, reason: "unknown_email" });
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.isActive === false) {
      await logLoginAttempt({ email, success: false, userId: user._id.toString(), name: `${user.firstName} ${user.lastName}`, role: user.role, reason: "account_suspended" });
      return NextResponse.json({ error: "Account suspended. Contact support." }, { status: 403 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await logLoginAttempt({ email, success: false, userId: user._id.toString(), name: `${user.firstName} ${user.lastName}`, role: user.role, reason: "invalid_password" });
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    await logLoginAttempt({ email, success: true, userId: user._id.toString(), name: `${user.firstName} ${user.lastName}`, role: user.role });

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
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
