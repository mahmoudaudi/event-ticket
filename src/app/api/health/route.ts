import { NextResponse } from "next/server";
import { connectDB } from "@/lib";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: "ok", db: "connected" });
  } catch (error) {
    return NextResponse.json({ status: "error", message: (error as Error).message }, { status: 500 });
  }
}
