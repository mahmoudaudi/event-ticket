"use client";
import Link from "next/link";

interface EventData {
  _id: string; title: string; description: string; category: string;
  date: string; location: string; price: number; img: string;
}

interface FeaturedCarouselProps {
  events: EventData[];
  loading: boolean;
  featuredSectionRef: React.RefObject<HTMLDivElement | null>;
  featuredRef: React.RefObject<HTMLDivElement | null>;
  autoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
}

export default function FeaturedCarousel({
  events, loading, featuredSectionRef, featuredRef, autoScroll, setAutoScroll,
}: FeaturedCarouselProps) {
  const featuredEvents = events.slice(0, 2);
  const scrollFeatured = (dir: "left" | "right") => {
    if (!featuredRef.current) return;
    featuredRef.current.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };

  return (
    <section
      ref={featuredSectionRef} id="featured"
      className="py-[80px] bg-surface-container-low overflow-hidden"
      onMouseEnter={() => setAutoScroll(false)}
      onMouseLeave={() => setAutoScroll(true)}
    >
      <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto mb-[32px] flex justify-between items-end scroll-reveal">
        <div>
          <span className="text-primary text-[14px] leading-[20px] tracking-[0.02em] font-medium tracking-[0.2em] uppercase mb-2 block">Curation</span>
          <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold font-headline text-on-surface">Featured Experiences</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scrollFeatured("left")} className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button onClick={() => scrollFeatured("right")} className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface transition-colors cursor-pointer">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
      {loading ? (
        <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto">
          <div className="min-w-[280px] sm:min-w-[400px] md:min-w-[600px] aspect-[16/9] rounded-2xl animate-shimmer" />
        </div>
      ) : featuredEvents.length === 0 ? (
        <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto text-center py-12 text-on-surface-variant">
          No featured events yet. Check back soon!
        </div>
      ) : (
        <div ref={featuredRef} className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto overflow-x-auto hide-scrollbar flex gap-[24px] scroll-reveal scroll-reveal-delay-1">
          {featuredEvents.map((ev) => (
            <Link key={ev._id} href={`/events/${ev._id}`} className="min-w-[280px] sm:min-w-[400px] md:min-w-[600px] group block">
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4">
                {ev.img ? (
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={ev.title} src={ev.img} crossOrigin="anonymous" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/735c00/ffffff?text=Aurum'; }} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary/40">image</span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-primary text-on-primary text-[12px] leading-[16px] tracking-[0.05em] font-semibold px-4 py-1.5 rounded-full shadow-lg">Featured</div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-[14px] leading-[20px] tracking-[0.02em] font-medium opacity-80 mb-1">{ev.category}</p>
                  <h3 className="text-[24px] leading-[32px] font-semibold font-headline">{ev.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
