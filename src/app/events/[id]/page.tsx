import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import type { Metadata } from "next";
import EventDetailClient from "@/components/EventDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    const event = await Event.findById(id).lean();
    if (!event) return { title: "Event Not Found" };

    const title = `${(event as any).title} | Aurum`;
    const description = (event as any).description?.slice(0, 160) || "Premium event experience on Aurum.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        images: (event as any).img ? [{ url: (event as any).img, width: 1200, height: 630 }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: (event as any).img ? [(event as any).img] : [],
      },
    };
  } catch {
    return { title: "Event Not Found" };
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  let event: any = null;

  try {
    await connectDB();
    event = await Event.findById(id).lean();
  } catch {}

  const jsonLd = event ? {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.eventDate || event.date,
    location: {
      "@type": "Place",
      name: event.venue || event.location,
      address: event.address || event.location,
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer || "Aurum",
    },
    image: event.bannerImage || event.img,
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <EventDetailClient id={id} />
    </>
  );
}
