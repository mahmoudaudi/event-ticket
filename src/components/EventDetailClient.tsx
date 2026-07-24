"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import EventHero from "@/components/EventHero";
import EventHighlights from "@/components/EventHighlights";
import VenueMap from "@/components/VenueMap";
import BookingWidget from "@/components/BookingWidget";
import OrganizerCard from "@/components/OrganizerCard";
import ShareWidget from "@/components/ShareWidget";
import EventFooter from "@/components/EventFooter";

interface Ticket {
  id: string; name: string; price: number; capacity: number; remaining: number;
}

interface EventDetail {
  _id: string; title: string; description: string; category: string;
  date: string; time: string; location: string; venue: string;
  organizer: string; img: string; tickets: Ticket[];
}

export default function EventDetailClient({ id }: { id: string }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => { setEvent(data.event); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const minPrice = event ? Math.min(...event.tickets.map((t) => t.price)) : 0;
  const firstTicket = event?.tickets[0];
  const totalRemaining = event?.tickets.reduce((s, t) => s + t.remaining, 0) ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-shimmer w-16 h-16 rounded-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-5xl text-outline">search_off</span>
        <p className="text-on-surface-variant">Event not found.</p>
        <Link href="/" className="text-primary font-medium hover:underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-[0px_4px_20px_rgba(30,41,59,0.05)] h-20">
        <div className="flex justify-between items-center w-full px-[16px] md:px-[40px] max-w-[1280px] mx-auto h-full">
          <Link href="/" className="text-[24px] leading-[32px] font-semibold font-headline font-bold text-primary">Aurum</Link>
          <Link href="/login" className="hidden sm:flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-[14px] leading-[20px] tracking-[0.02em] font-medium group">
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">login</span>
            Sign in
          </Link>
        </div>
      </nav>

      <main className="pt-20">
        <EventHero
          title={event.title} category={event.category}
          date={event.date} time={event.time} location={event.location}
          img={event.img} totalRemaining={totalRemaining}
        />

        <section className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(30,41,59,0.05)] border border-outline-variant/30">
              <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold font-headline text-on-surface mb-4">About the Event</h2>
              <div className="space-y-4 text-on-surface-variant text-[18px] leading-[28px]">
                <p>{event.description}</p>
              </div>
              <EventHighlights />
            </div>
            <VenueMap venue={event.venue} location={event.location} />
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <BookingWidget
                minPrice={minPrice} totalRemaining={totalRemaining}
                firstTicket={firstTicket} date={event.date} time={event.time}
              />
              <OrganizerCard organizer={event.organizer} />
              <ShareWidget />
            </div>
          </div>
        </section>
      </main>

      <EventFooter />
    </div>
  );
}
