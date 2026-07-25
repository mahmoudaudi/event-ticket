"use client";
import Link from "next/link";

interface EventData {
  _id: string; title: string; description: string; category: string;
  date: string; location: string; price: number; img: string;
}

interface EventsGridProps {
  filteredEvents: EventData[];
  paginatedEvents: EventData[];
  loading: boolean;
  priceRange: number;
  setPriceRange: (v: number) => void;
  activeCategory: string;
  setActiveCategory: (v: string) => void;
  setCurrentPage: (v: number) => void;
  categories: string[];
  sortBy: string;
  setSortBy: (v: string) => void;
  safePage: number;
  totalPages: number;
  currentPage: number;
  eventsRef: React.RefObject<HTMLDivElement | null>;
}

export default function EventsGrid({
  filteredEvents, paginatedEvents, loading, priceRange, setPriceRange,
  activeCategory, setActiveCategory, setCurrentPage, categories,
  sortBy, setSortBy, safePage, totalPages, currentPage, eventsRef,
}: EventsGridProps) {
  return (
    <section ref={eventsRef} id="events" className="py-[80px] px-[16px] md:px-[40px] max-w-[1280px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-[32px]">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h4 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface mb-4 uppercase tracking-widest">Filters</h4>
              <div className="space-y-6">
                <div>
                  <p className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline mb-3">Price Bracket</p>
                  <input value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary" type="range" min="0" max="2500" />
                  <div className="flex justify-between mt-2 text-[12px] leading-[16px] text-on-surface-variant">
                    <span>$0</span>
                    <span>${priceRange > 2000 ? "2500+" : priceRange}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline mb-3">Experience Type</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                        className={`px-3 py-1 rounded-full text-[12px] leading-[16px] tracking-[0.05em] font-semibold transition-colors cursor-pointer ${
                          activeCategory === cat
                            ? "bg-primary-container text-on-primary-container"
                            : "bg-surface-container text-on-surface-variant hover:bg-outline-variant"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-primary rounded-2xl text-on-primary relative overflow-hidden group">
              <div className="relative z-10">
                <h5 className="text-[24px] leading-[32px] font-semibold font-headline mb-2">Member Rewards</h5>
                <p className="text-[14px] leading-[20px] opacity-90 mb-4">Join our Inner Circle for early access to global premieres.</p>
                <Link href="/signup" className="block w-full bg-white text-primary py-2 rounded-lg text-[14px] leading-[20px] tracking-[0.02em] font-medium text-center hover:opacity-90 transition-opacity">Join Now</Link>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-8 scroll-reveal">
            <h3 className="text-[24px] leading-[32px] font-semibold font-headline">
              {loading ? "Loading..." : `${filteredEvents.length} Event${filteredEvents.length !== 1 ? "s" : ""} Found`}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline uppercase">Sort By:</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none text-[14px] leading-[20px] tracking-[0.02em] font-medium text-primary focus:ring-0 outline-none">
                <option>Recommended</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-surface-container-lowest rounded-2xl overflow-hidden">
                  <div className="h-48 animate-shimmer" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 animate-shimmer rounded w-1/3" />
                    <div className="h-6 animate-shimmer rounded w-3/4" />
                    <div className="h-4 animate-shimmer rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 scroll-reveal">
              <span className="material-symbols-outlined text-[48px] text-outline mb-4">search_off</span>
              <p className="text-[18px] leading-[28px] text-on-surface-variant">No events match your filters. Try adjusting them!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] scroll-reveal">
                {paginatedEvents.map((ev) => (
                  <Link key={ev._id} href={`/events/${ev._id}`} className="bg-surface-container-lowest rounded-2xl overflow-hidden premium-card-shadow flex flex-col">
                    <div className="relative h-48">
                      {ev.img ? (
                        <img className="w-full h-full object-cover" alt={ev.title} src={ev.img} crossOrigin="anonymous" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/735c00/ffffff?text=Aurum'; }} />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-primary/40">image</span>
                        </div>
                      )}
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-primary font-bold text-[14px] leading-[20px] shadow-sm">${ev.price}</div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                        <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">{ev.date}</span>
                      </div>
                      <h4 className="text-[24px] leading-[32px] font-semibold font-headline mb-2 text-on-surface">{ev.title}</h4>
                      <p className="text-[14px] leading-[20px] text-on-surface-variant line-clamp-2 mb-6">{ev.description}</p>
                      <div className="mt-auto flex justify-between items-center pt-4 border-t border-outline-variant/30">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-outline text-[18px]">location_on</span>
                          <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">{ev.location}</span>
                        </div>
                        <span className="text-primary text-[14px] leading-[20px] tracking-[0.02em] font-medium flex items-center gap-1">
                          Details
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                  <button onClick={() => setCurrentPage(Math.max(1, safePage - 1))} disabled={safePage === 1} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-30 hover:bg-surface-container transition-colors disabled:cursor-not-allowed cursor-pointer">
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg text-[14px] leading-[20px] tracking-[0.02em] font-medium transition-colors cursor-pointer ${safePage === i + 1 ? "bg-primary text-on-primary" : "hover:bg-surface-container"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))} disabled={safePage === totalPages} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
