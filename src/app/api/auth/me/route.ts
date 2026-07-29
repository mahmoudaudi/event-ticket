import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ active: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    await connectDB();
    const user = await User.findById(decoded.userId).select("isActive role firstName lastName email").lean();

    if (!user || user.isActive === false) {
      return NextResponse.json({ active: false, reason: "suspended" }, { status: 403 });
    }

    return NextResponse.json({
      active: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ active: false }, { status: 401 });
  }
}
