import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, TicketType, Booking, Category } from "@/models";
import { chatWithGroq } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await connectDB();

    const events = await Event.find({})
      .populate<{ categoryId: { _id: string; name: string } }>("categoryId", "name")
      .lean();

    const enrichedEvents = await Promise.all(
      (events as any[]).map(async (ev) => {
        const ticketTypes = (await TicketType.find({ eventId: ev._id })
          .sort({ price: 1 })
          .lean()) as any[];
        return {
          title: ev.title,
          description: ev.description,
          category: (ev.categoryId as any)?.name || "General",
          date: ev.eventDate ? new Date(ev.eventDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : "",
          time: ev.startTime || "",
          venue: ev.venue,
          address: ev.address,
          city: ev.city,
          price: ticketTypes.length > 0 ? `$${ticketTypes[0].price} - $${Math.max(...ticketTypes.map((t: any) => t.price))}` : "Free",
          tickets: ticketTypes.map((t: any) => ({ name: t.name, price: `$${t.price}`, capacity: t.capacity, remaining: t.remainingSeats })),
        };
      })
    );

    const systemPrompt = `You are Aurum AI, a helpful assistant for Aurum event ticket platform. Be concise and friendly.

IMPORTANT LANGUAGE RULE: You MUST ALWAYS respond in the EXACT SAME LANGUAGE as the user's message. If the user writes in Arabic (العربية), reply in Arabic. If English, reply in English. If they mix languages, use the primary language. NEVER reply in Chinese, Japanese, Korean, or any other language unless the user writes in that language. This is critical.

Format your responses using Markdown:
- Use **bold** for event names
- Use bullet lists for multiple items (events, features)
- Use headings (##) for sections
- Use \`code\` for prices and dates
- Use emoji when appropriate (🎵 for music, 💻 for tech, 🎨 for art)
- Keep responses short and scannable

Current date: ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}

Available events:
${JSON.stringify(enrichedEvents, null, 2)}

You can help users with:
- Finding events by category, date, location, or price
- Event details (description, schedule, tickets)
- General inquiries about the platform

If a user asks about booking, tell them to visit the event page and click "Book Now".
If they ask about account issues, tell them to use the Login/Signup page.
If you don't have enough info, ask clarifying questions.
Do NOT make up events or information not in the data above.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...(history || []).slice(-10),
      { role: "user" as const, content: message },
    ];

    const reply = await chatWithGroq(messages);

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
