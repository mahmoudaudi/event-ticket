"use client";

interface HeroProps {
  discoverRef: React.RefObject<HTMLHeadingElement | null>;
  eventName: string;
  setEventName: (v: string) => void;
  activeCategory: string;
  setActiveCategory: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  handleFindTickets: () => void;
  isSearching: boolean;
  categories: string[];
  setCurrentPage: (v: number) => void;
}

export default function Hero({
  discoverRef, eventName, setEventName, activeCategory,
  setActiveCategory, location, setLocation, handleFindTickets,
  isSearching, categories, setCurrentPage,
}: HeroProps) {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden py-[80px] bg-gradient-to-b from-surface to-background">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />
      </div>
      <div className="relative z-10 w-full px-[16px] md:px-[40px] max-w-[1280px] mx-auto text-center scroll-reveal">
        <h1 ref={discoverRef} id="discover" className="text-[32px] sm:text-[48px] leading-[40px] sm:leading-[56px] font-bold tracking-[-0.02em] font-display text-on-surface mb-[16px] max-w-3xl mx-auto">
          Extraordinary Moments, <span className="text-primary">Seamlessly</span> Reserved.
        </h1>
        <p className="text-[18px] leading-[28px] text-on-surface-variant mb-12 max-w-2xl mx-auto">
          Access the most exclusive corporate galas, tech summits, and cultural performances with the world&apos;s most refined event platform.
        </p>
        <div className="max-w-4xl mx-auto bg-surface-container-lowest rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row items-stretch gap-2">
          <div className="flex-1 flex items-center px-4 py-3 gap-3 border-r border-outline-variant/30">
            <span className="material-symbols-outlined text-primary">event</span>
            <div className="text-left">
              <label className="block text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline uppercase">Event Name</label>
              <input value={eventName} onChange={e => setEventName(e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 text-[16px] leading-[24px] font-medium placeholder:text-surface-dim outline-none" placeholder="Design Week 2024" type="text" />
            </div>
          </div>
          <div className="flex-1 flex items-center px-4 py-3 gap-3 border-r border-outline-variant/30">
            <span className="material-symbols-outlined text-primary">category</span>
            <div className="text-left">
              <label className="block text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline uppercase">Category</label>
              <select value={activeCategory} onChange={e => { setActiveCategory(e.target.value); setCurrentPage(1); }} className="w-full bg-transparent border-none p-0 focus:ring-0 text-[16px] leading-[24px] font-medium outline-none appearance-none">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex-1 flex items-center px-4 py-3 gap-3">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <div className="text-left">
              <label className="block text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline uppercase">Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 text-[16px] leading-[24px] font-medium placeholder:text-surface-dim outline-none" placeholder="San Francisco, CA" type="text" />
            </div>
          </div>
          <button onClick={handleFindTickets} className="bg-primary text-on-primary px-10 rounded-xl text-[14px] leading-[20px] tracking-[0.02em] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all py-4 cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">search</span>
            {isSearching ? "Searching..." : "Find Tickets"}
          </button>
        </div>
      </div>
    </section>
  );
}
