import Link from "next/link";

interface EventHeroProps {
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  img: string;
  totalRemaining: number;
}

export default function EventHero({ title, category, date, time, location, img, totalRemaining }: EventHeroProps) {
  return (
    <section className="relative w-full h-[400px] md:h-[614px] overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        {img ? (
          <img className="w-full h-full object-cover" alt={title} src={img} crossOrigin="anonymous" referrerPolicy="no-referrer" onError={(e) => { const l = title.charAt(0).toUpperCase(); (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="614" viewBox="0 0 1200 614"><rect fill="#1a1a2e" width="1200" height="614"/><text x="600" y="400" font-size="180" fill="#e0e0e0" text-anchor="middle" font-family="Arial,sans-serif">${l}</text></svg>`)}`; }} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-container/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-primary/40">image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>
      <Link href="/" className="absolute top-4 left-4 md:top-6 md:left-6 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-on-surface hover:text-primary transition-colors">
        <span className="material-symbols-outlined text-xl">arrow_back</span>
      </Link>
      <div className="absolute bottom-0 left-0 right-0 px-[16px] md:px-[40px] max-w-[1280px] mx-auto pb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[12px] leading-[16px] tracking-[0.05em] font-semibold border border-primary/20">{category}</span>
          {totalRemaining <= 20 && totalRemaining > 0 && (
            <span className="bg-orange-50 text-amber-700 px-3 py-1 rounded-full text-[12px] leading-[16px] tracking-[0.05em] font-semibold border border-amber-200">Selling Fast</span>
          )}
        </div>
        <h1 className="text-[32px] sm:text-[48px] leading-[40px] sm:leading-[56px] font-bold tracking-[-0.02em] font-display text-on-surface mb-4 max-w-3xl">{title}</h1>
        <div className="flex flex-wrap items-center gap-6 text-on-surface-variant text-[16px] leading-[24px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
            <span>{date} &bull; {time}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
            <span>{location}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
