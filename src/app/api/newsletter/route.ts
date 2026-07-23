import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    await connectDB();
    await Subscriber.create({ phone });

    return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
