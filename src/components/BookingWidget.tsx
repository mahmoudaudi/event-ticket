import Link from "next/link";

interface Ticket {
  id: string; name: string; price: number; capacity: number; remaining: number;
}

interface BookingWidgetProps {
  eventId: string;
  minPrice: number;
  totalRemaining: number;
  firstTicket: Ticket | undefined;
  date: string;
  time: string;
}

export default function BookingWidget({ eventId, minPrice, totalRemaining, firstTicket, date, time }: BookingWidgetProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_10px_30px_rgba(30,41,59,0.08)] border border-primary/20">
      <div className="flex justify-between items-end mb-6">
        <div>
          <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant uppercase tracking-wider">Starting from</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold text-on-surface">${minPrice.toFixed(2)}</span>
            <span className="text-[14px] leading-[20px] text-on-surface-variant">/ person</span>
          </div>
        </div>
        {totalRemaining <= 20 && totalRemaining > 0 && (
          <span className="bg-error/10 text-error px-2 py-1 rounded text-[12px] leading-[16px] tracking-[0.05em] font-semibold">Only {totalRemaining} seats left</span>
        )}
      </div>
      <div className="space-y-4 mb-6">
        {firstTicket && (
          <div className="flex justify-between text-[14px] leading-[20px] tracking-[0.02em] font-medium">
            <span className="text-on-surface-variant">Tier</span>
            <span className="text-on-surface">{firstTicket.name}</span>
          </div>
        )}
        <div className="flex justify-between text-[14px] leading-[20px] tracking-[0.02em] font-medium">
          <span className="text-on-surface-variant">Date</span>
          <span className="text-on-surface">{date}</span>
        </div>
        <div className="flex justify-between text-[14px] leading-[20px] tracking-[0.02em] font-medium">
          <span className="text-on-surface-variant">Time</span>
          <span className="text-on-surface">{time}</span>
        </div>
      </div>
      <Link
        href={`/events/${eventId}/seats`}
        className="w-full py-4 bg-primary text-on-primary rounded-lg text-[24px] leading-[32px] font-semibold font-headline hover:opacity-90 transition-all flex items-center justify-center gap-2 group cursor-pointer"
      >
        Select Seats
        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </Link>
      <p className="mt-4 text-center text-[14px] leading-[20px] text-on-surface-variant">No hidden booking fees. Secure checkout via Stripe.</p>
    </div>
  );
}
