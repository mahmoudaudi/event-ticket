import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Subscriber } from "@/models";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const exists = await Subscriber.findOne({ email });
    if (exists) {
      return NextResponse.json({ message: "Already subscribed" });
    }

    await Subscriber.create({ email });

    return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
