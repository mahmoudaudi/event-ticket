import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_auth_failed`);
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_token_failed`);
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await userRes.json();
    if (!userRes.ok) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_profile_failed`);
    }

    await connectDB();

    let user = await User.findOne({ email: profile.email });

    if (!user) {
      const randomPassword = await bcrypt.hash(crypto.randomUUID(), 12);
      user = await User.create({
        firstName: profile.given_name || "Google",
        lastName: profile.family_name || "User",
        email: profile.email,
        password: randomPassword,
        profileImage: profile.picture,
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const clientUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL}/`);
    clientUrl.searchParams.set("token", token);
    clientUrl.searchParams.set(
      "user",
      JSON.stringify({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      })
    );

    return NextResponse.redirect(clientUrl.toString());
  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=google_error`);
  }
}
