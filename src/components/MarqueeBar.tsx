"use client";

export default function MarqueeBar() {
  return (
    <div className="fixed top-20 left-0 right-0 z-40 h-10 bg-primary overflow-hidden flex items-center">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="mx-8 text-on-primary text-[13px] leading-[16px] font-medium tracking-[0.02em]">
          🎫 Early bird tickets available for Tech Summit 2024 — grab yours now!
        </span>
        <span className="mx-8 text-on-primary text-[13px] leading-[16px] font-medium tracking-[0.02em]">
          ✨ New events added weekly — stay tuned for exclusive experiences
        </span>
        <span className="mx-8 text-on-primary text-[13px] leading-[16px] font-medium tracking-[0.02em]">
          🎶 Music Festival tickets selling fast — don&apos;t miss out
        </span>
        <span className="mx-8 text-on-primary text-[13px] leading-[16px] font-medium tracking-[0.02em]">
          🎫 Early bird tickets available for Tech Summit 2024 — grab yours now!
        </span>
        <span className="mx-8 text-on-primary text-[13px] leading-[16px] font-medium tracking-[0.02em]">
          ✨ New events added weekly — stay tuned for exclusive experiences
        </span>
        <span className="mx-8 text-on-primary text-[13px] leading-[16px] font-medium tracking-[0.02em]">
          🎶 Music Festival tickets selling fast — don&apos;t miss out
        </span>
      </div>
    </div>
  );
}
