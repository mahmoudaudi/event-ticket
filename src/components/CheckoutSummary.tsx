'use client';

import React, { useMemo } from 'react';
import type { CheckoutEvent, CheckoutSeat } from '@/lib/checkoutStorage';

type Props = {
  event: CheckoutEvent;
  seats: CheckoutSeat[];
  fee?: number;
};

export default function CheckoutSummary({ event, seats, fee = 9 }: Props) {
  const subtotal = useMemo(() => seats.reduce((s, seat) => s + seat.price, 0), [seats]);
  const total = subtotal + fee;

  const formattedEventDate = useMemo(() => {
    if (!event.eventDate) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(event.eventDate));
  }, [event.eventDate]);

  return (
    <aside className="sticky top-28 space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-56">
          <img className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTCmNs2O_kBRTDpoDoTpI-PwI0NINQDULzGgCy_dWSXgtOaw5XjJDa96Mir5pqUmPAczyiVb8RSrugtOaPjXVsKusFXlIdBhdbm64kN8RSS_JIs9FNq6cFeWocpuBGEHOMyDtIp9WNBzroauyfLn-Yj3au9Yd9mQUoDPrV368IbP1qnErbHQ9RgeJ5uSMbhObm-Pst-VWHHT1Bhq-M2zXGQy31FiyKGVP1UE-Fi2rswV43CR3ndBQz8jJSdEa60m7B1u7rdE6IEI8" alt={event.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <span className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-900">Premium Experience</span>
            <h3 className="text-3xl font-semibold leading-tight text-white">
  {event.title}
</h3>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3 text-slate-600">
            <span className="material-symbols-outlined text-amber-900"></span>
            <div>
              <div className="text-sm font-semibold text-slate-900">{formattedEventDate}</div>
              <div className="text-sm text-slate-500">{event.startTime ?? '09:00 AM EST'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600">
            <span className="material-symbols-outlined text-amber-900"></span>
            <div>
              <div className="text-sm font-semibold text-slate-900">{event.venue}</div>
              <div className="text-sm text-slate-500">New York City, NY</div>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          <div className="space-y-3">
            {seats.map((seat) => (
              <div key={seat.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-600">{seat.section} • Row {seat.row} (Seat {seat.label})</span>
                <span className="font-semibold text-slate-900">${seat.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-600">Processing Fee</span>
              <span className="font-semibold text-slate-900">${fee.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <span className="text-lg font-semibold text-slate-900">Total</span>
              <span className="text-3xl font-bold text-amber-900">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-[#e8edff] p-4 text-sm text-slate-700">
        <span className="material-symbols-outlined text-amber-900">info</span>
        <p>Only 12 tickets left at this price point. Your reservation is held for 14:59 minutes.</p>
      </div>
    </aside>
  );
}
