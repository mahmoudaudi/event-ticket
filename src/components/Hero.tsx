"use client";

interface HeroProps {
  discoverRef: React.RefObject<HTMLHeadingElement | null>;
  handleFindTickets: () => void;
  isSearching: boolean;
}

export default function Hero({
  discoverRef, handleFindTickets, isSearching,
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
        <div className="flex justify-center">
          <button onClick={handleFindTickets} className="bg-primary text-on-primary px-10 py-4 rounded-xl text-[14px] leading-[20px] tracking-[0.02em] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">search</span>
            {isSearching ? "Searching..." : "Find Tickets"}
          </button>
        </div>
      </div>
    </section>
  );
}
