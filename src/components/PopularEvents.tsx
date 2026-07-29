"use client";
import Link from "next/link";

interface EventData {
  _id: string; title: string; description: string; category: string;
  date: string; location: string; price: number; img: string;
}

interface PopularEventsProps {
  events: EventData[];
  loading: boolean;
  popularRef: React.RefObject<HTMLDivElement | null>;
}

export default function PopularEvents({ events, loading, popularRef }: PopularEventsProps) {
  return (
    <section ref={popularRef} id="popular" className="py-[80px] px-[16px] md:px-[40px] max-w-[1280px] mx-auto">
      <div className="mb-10 scroll-reveal">
        <span className="text-primary text-[14px] leading-[20px] tracking-[0.02em] font-medium tracking-[0.2em] uppercase mb-2 block">Trending</span>
        <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold font-headline text-on-surface">Popular Events</h2>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="h-56 rounded-2xl animate-shimmer" />)}
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-on-surface-variant py-12">No popular events yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {events.slice(0, 2).map((ev) => (
            <Link key={ev._id} href={`/events/${ev._id}`} className="group relative bg-surface-container-lowest rounded-2xl overflow-hidden premium-card-shadow flex flex-col sm:flex-row">
              <div className="relative sm:w-2/5 h-48 sm:h-auto">
                {ev.img ? (
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={ev.title} src={ev.img} crossOrigin="anonymous" referrerPolicy="no-referrer" onError={(e) => { const l = ev.title.charAt(0).toUpperCase(); (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect fill="#1a1a2e" width="600" height="400"/><text x="300" y="260" font-size="140" fill="#e0e0e0" text-anchor="middle" font-family="Arial,sans-serif">${l}</text></svg>`)}`; }} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-primary/40">image</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-error text-on-error text-[11px] leading-[16px] font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">whatshot</span>
                  Popular
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">{ev.category}</span>
                </div>
                <h3 className="text-[20px] leading-[28px] font-semibold font-headline text-on-surface mb-2 group-hover:text-primary transition-colors">{ev.title}</h3>
                <p className="text-[14px] leading-[20px] text-on-surface-variant line-clamp-2 mb-4">{ev.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-3 text-[12px] leading-[16px] text-on-surface-variant">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{ev.location}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span>{ev.date}</span>
                  </div>
                  <span className="text-primary font-bold text-base">${ev.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
