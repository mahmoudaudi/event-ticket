import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { hashPassword, verifyPassword } from "@/lib/password";
import { requireAdmin } from "@/lib/guards";
import { withErrorLogging } from "@/lib/withErrorLogging";

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const profileSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
});

export const PATCH = withErrorLogging(async (request: Request) => {
  const session = await requireAdmin();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  await connectDB();
  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Password change
  if (body.currentPassword) {
    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const isValid = await verifyPassword(parsed.data.currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    user.password = await hashPassword(parsed.data.newPassword);
    await user.save();
    return NextResponse.json({ success: true });
  }

  // Profile update (name, email)
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const existing = await User.findOne({ email: parsed.data.email, _id: { $ne: user._id } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use by another account" }, { status: 409 });
  }

  user.firstName = parsed.data.firstName;
  user.lastName = parsed.data.lastName;
  user.email = parsed.data.email;
  await user.save();

  return NextResponse.json({ success: true, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email } });
});
