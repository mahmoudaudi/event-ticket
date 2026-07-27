import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "event-premium-secret-key-change-in-production-2026") as { userId: string };

    const form = await req.formData();
    const firstName = form.get("firstName") as string;
    const lastName = form.get("lastName") as string;
    const imageFile = form.get("profileImage") as File | null;

    await connectDB();
    const update: Record<string, string> = {};
    if (firstName) update.firstName = firstName;
    if (lastName) update.lastName = lastName;

    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split(".").pop() || "jpg";
      const filename = `${decoded.userId}-${Date.now()}.${ext}`;
      const dir = path.join(process.cwd(), "public", "uploads", "profiles");
      await mkdir(dir, { recursive: true });
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await writeFile(path.join(dir, filename), buffer);
      update.profileImage = `/uploads/profiles/${filename}`;
    }

    const updated = await User.findByIdAndUpdate(decoded.userId, update, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: { firstName: updated.firstName, lastName: updated.lastName, email: updated.email, profileImage: updated.profileImage },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 401 });
  }
}
