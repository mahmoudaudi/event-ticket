"use client";

interface CategoryCardsProps {
  setActiveCategory: (v: string) => void;
  setCurrentPage: (v: number) => void;
  scrollTo: (ref: React.RefObject<HTMLDivElement | HTMLHeadingElement | null>) => void;
  eventsRef: React.RefObject<HTMLDivElement | null>;
  categoriesRef: React.RefObject<HTMLDivElement | null>;
}

const cards = [
  { name: "Tech", icon: "devices", gradient: "from-blue-600 to-blue-800", desc: "Innovation & digital" },
  { name: "Music", icon: "music_note", gradient: "from-purple-600 to-purple-800", desc: "Live performances" },
  { name: "Art", icon: "palette", gradient: "from-pink-600 to-pink-800", desc: "Exhibitions & design" },
  { name: "Workshop", icon: "handyman", gradient: "from-amber-600 to-amber-800", desc: "Learn & create" },
];

export default function CategoryCards({ setActiveCategory, setCurrentPage, scrollTo, eventsRef, categoriesRef }: CategoryCardsProps) {
  return (
    <section ref={categoriesRef} className="py-[80px] px-[16px] md:px-[40px] max-w-[1280px] mx-auto">
      <div className="text-center mb-12 scroll-reveal">
        <span className="text-primary text-[14px] leading-[20px] tracking-[0.02em] font-medium tracking-[0.2em] uppercase mb-2 block">Browse</span>
        <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold font-headline text-on-surface">Event Categories</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 scroll-reveal scroll-reveal-delay-1">
        {cards.map((cat) => (
          <button
            key={cat.name}
            onClick={() => { setActiveCategory(cat.name); setCurrentPage(1); setTimeout(() => scrollTo(eventsRef), 100); }}
            className={`group relative overflow-hidden rounded-2xl p-6 text-left text-white bg-gradient-to-br ${cat.gradient} transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer`}
          >
            <span className="material-symbols-outlined text-3xl mb-3 block opacity-90 group-hover:scale-110 transition-transform">
              {cat.icon}
            </span>
            <h3 className="text-lg font-semibold font-headline mb-1">{cat.name}</h3>
            <p className="text-sm text-white/70">{cat.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
