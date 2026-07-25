"use client";

interface EventData {
  _id: string; title: string; date: string; location: string;
  price: number; img: string; category: string; description: string;
}

export default function EventsMap({ events }: { events?: EventData[] }) {
  const items = events ?? [];
  const hasCoordinates = items.length > 0;

  if (!hasCoordinates) {
    return (
      <section className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto pb-[80px]">
        <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-bold font-headline text-on-surface mb-8">Event Locations</h2>
        <div className="w-full h-[400px] rounded-2xl bg-surface-container flex items-center justify-center">
          <p className="text-on-surface-variant">Map will be available when events have location data.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto pb-[80px]">
      <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-bold font-headline text-on-surface mb-8">Event Locations</h2>
      <div className="w-full h-[400px] rounded-2xl overflow-hidden bg-surface-container">
        <iframe
          title="Event Locations Map"
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(items[0]?.location || "World")}&output=embed`}
        />
      </div>
    </section>
  );
}
