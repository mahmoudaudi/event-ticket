"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface Ticket {
  id: string;
  name: string;
  price: number;
  capacity: number;
  remaining: number;
}

interface EventDetail {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  organizer: string;
  img: string;
  tickets: Ticket[];
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data.event);
        setLoading(false);
      })
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
        <section className="relative w-full h-[400px] md:h-[614px] overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            {event.img ? (
              <img className="w-full h-full object-cover" alt={event.title} src={event.img} crossOrigin="anonymous" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/1200x600/735c00/ffffff?text=Aurum'; }} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-primary/40">image</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-[16px] md:px-[40px] max-w-[1280px] mx-auto pb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[12px] leading-[16px] tracking-[0.05em] font-semibold border border-primary/20">{event.category}</span>
              {totalRemaining <= 20 && totalRemaining > 0 && (
                <span className="bg-orange-50 text-amber-700 px-3 py-1 rounded-full text-[12px] leading-[16px] tracking-[0.05em] font-semibold border border-amber-200">Selling Fast</span>
              )}
            </div>
            <h1 className="text-[32px] sm:text-[48px] leading-[40px] sm:leading-[56px] font-bold tracking-[-0.02em] font-display text-on-surface mb-4 max-w-3xl">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-on-surface-variant text-[16px] leading-[24px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                <span>{event.date} &bull; {event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                <span>{event.location}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(30,41,59,0.05)] border border-outline-variant/30">
              <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold font-headline text-on-surface mb-4">About the Event</h2>
              <div className="space-y-4 text-on-surface-variant text-[18px] leading-[28px]">
                <p>{event.description}</p>
              </div>
              <div className="mt-6 pt-6 border-t border-outline-variant/30">
                <h3 className="text-[24px] leading-[32px] font-semibold font-headline text-on-surface mb-4">Event Highlights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-surface rounded-lg">
                    <span className="material-symbols-outlined text-primary mt-1">wine_bar</span>
                    <div>
                      <h4 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface">Complimentary Reception</h4>
                      <p className="text-[12px] leading-[16px] tracking-[0.05em] text-on-surface-variant">Arrival drinks and hors d&apos;oeuvres starting at 7:00 PM.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-surface rounded-lg">
                    <span className="material-symbols-outlined text-primary mt-1">auto_awesome</span>
                    <div>
                      <h4 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface">Digital Program</h4>
                      <p className="text-[12px] leading-[16px] tracking-[0.05em] text-on-surface-variant">Exclusive artist commentary accessible via the app.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(30,41,59,0.05)] border border-outline-variant/30 overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold font-headline text-on-surface">Venue Location</h2>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(event.venue + " " + event.location)}`} target="_blank" rel="noopener noreferrer" className="text-primary text-[14px] leading-[20px] tracking-[0.02em] font-medium hover:underline">Get Directions</a>
              </div>
              <div className="relative w-full h-[300px] rounded-lg overflow-hidden bg-secondary-container/20 flex items-center justify-center">
                <div className="absolute inset-0 bg-secondary-container/20" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <span className="material-symbols-outlined text-on-primary">location_on</span>
                  </div>
                  <div className="mt-2 px-3 py-1 bg-on-surface text-surface rounded text-[12px] leading-[16px] tracking-[0.05em] font-semibold shadow-md">
                    {event.venue}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_10px_30px_rgba(30,41,59,0.08)] border border-primary/20">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant uppercase tracking-wider">Starting from</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold text-on-surface">${minPrice.toFixed(2)}</span>
                      <span className="text-[14px] leading-[20px] text-on-surface-variant">/ person</span>
                    </div>
                  </div>
                  {totalRemaining <= 20 && totalRemaining > 0 && (
                    <span className="bg-error/10 text-error px-2 py-1 rounded text-[12px] leading-[16px] tracking-[0.05em] font-semibold">Only {totalRemaining} seats left</span>
                  )}
                </div>
                <div className="space-y-4 mb-6">
                  {firstTicket && (
                    <div className="flex justify-between text-[14px] leading-[20px] tracking-[0.02em] font-medium">
                      <span className="text-on-surface-variant">Tier</span>
                      <span className="text-on-surface">{firstTicket.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[14px] leading-[20px] tracking-[0.02em] font-medium">
                    <span className="text-on-surface-variant">Date</span>
                    <span className="text-on-surface">{event.date}</span>
                  </div>
                  <div className="flex justify-between text-[14px] leading-[20px] tracking-[0.02em] font-medium">
                    <span className="text-on-surface-variant">Time</span>
                    <span className="text-on-surface">{event.time}</span>
                  </div>
                </div>
                <button className="w-full py-4 bg-primary text-on-primary rounded-lg text-[24px] leading-[32px] font-semibold font-headline hover:opacity-90 transition-all flex items-center justify-center gap-2 group cursor-pointer">
                  Select Seats
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <p className="mt-4 text-center text-[14px] leading-[20px] text-on-surface-variant">No hidden booking fees. Secure checkout via Stripe.</p>
              </div>

              <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">theater_comedy</span>
                </div>
                <div>
                  <h5 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface">Organized by</h5>
                  <p className="text-[14px] leading-[20px] font-semibold text-primary">{event.organizer}</p>
                </div>
                <button className="ml-auto p-2 hover:bg-surface rounded-full transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-on-surface-variant">chat_bubble</span>
                </button>
              </div>

              <div className="flex justify-between items-center px-4 py-2 border border-outline-variant/20 rounded-lg">
                <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">Share this event</span>
                <div className="flex gap-4">
                  <button className="hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined text-[20px]">share</span></button>
                  <button className="hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined text-[20px]">bookmark</span></button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-container-highest mt-[80px]">
        <div className="w-full py-[80px] px-[16px] md:px-[40px] flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-8">
          <div className="flex flex-col gap-2 items-center md:items-start">
            <Link href="/" className="text-[24px] leading-[32px] font-semibold font-headline font-bold text-on-surface">Aurum</Link>
            <p className="text-[14px] leading-[20px] text-on-surface-variant max-w-xs">Elevating the way you discover and book premium experiences.</p>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface uppercase tracking-widest mb-1">Company</span>
              <Link href="/contact" className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors">Help Center</Link>
              <Link href="/terms" className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface uppercase tracking-widest mb-1">Legal</span>
              <Link href="/privacy" className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="/contact" className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-outline-variant/30 py-6 px-[16px] md:px-[40px] max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center">
          <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">&copy; 2026 Aurum. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
