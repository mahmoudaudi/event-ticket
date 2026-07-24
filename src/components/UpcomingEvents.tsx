"use client";
import Link from "next/link";

interface EventData {
  _id: string; title: string; description: string; category: string;
  date: string; location: string; price: number; img: string;
}

interface UpcomingEventsProps {
  events: EventData[];
  loading: boolean;
  upcomingRef: React.RefObject<HTMLDivElement | null>;
}

export default function UpcomingEvents({ events, loading, upcomingRef }: UpcomingEventsProps) {
  return (
    <section ref={upcomingRef} className="py-[80px] px-[16px] md:px-[40px] max-w-[1280px] mx-auto bg-surface-container-low">
      <div className="mb-10 scroll-reveal">
        <span className="text-primary text-[14px] leading-[20px] tracking-[0.02em] font-medium tracking-[0.2em] uppercase mb-2 block">Don&apos;t Miss</span>
        <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold font-headline text-on-surface">Upcoming Events</h2>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-2xl animate-shimmer" />)}
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-on-surface-variant py-12">No upcoming events right now.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 scroll-reveal scroll-reveal-delay-1">
          {events.slice(0, 4).map((ev) => (
            <Link key={ev._id} href={`/events/${ev._id}`} className="group bg-surface-container-lowest rounded-2xl overflow-hidden premium-card-shadow">
              <div className="relative h-40">
                {ev.img ? (
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={ev.title} src={ev.img} crossOrigin="anonymous" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/735c00/ffffff?text=Aurum'; }} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-primary/40">image</span>
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-on-surface text-[11px] leading-[16px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">calendar_today</span>
                  {ev.date}
                </div>
              </div>
              <div className="p-4">
                <h4 className="text-[16px] leading-[24px] font-semibold font-headline text-on-surface mb-1 group-hover:text-primary transition-colors">{ev.title}</h4>
                <div className="flex items-center gap-1 text-[12px] leading-[16px] text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {ev.location}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-primary font-bold text-sm">${ev.price}</span>
                  <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    Book Now <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
