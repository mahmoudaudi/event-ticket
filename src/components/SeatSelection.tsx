'use client';

import { useMemo, useState } from 'react';

type Seat = {
  id: string;
  row: string;
  section: string;
  label: string;
  status: 'AVAILABLE' | 'RESERVED';
  price: number;
};

const seatLayout: Record<string, Seat[]> = {
  A: [
    { id: 'A1', row: 'A', section: 'VIP', label: '1', status: 'AVAILABLE', price: 180 },
    { id: 'A2', row: 'A', section: 'VIP', label: '2', status: 'AVAILABLE', price: 180 },
    { id: 'A3', row: 'A', section: 'VIP', label: '3', status: 'RESERVED', price: 180 },
    { id: 'A4', row: 'A', section: 'VIP', label: '4', status: 'AVAILABLE', price: 180 },
    { id: 'A5', row: 'A', section: 'VIP', label: '5', status: 'AVAILABLE', price: 180 },
    { id: 'A6', row: 'A', section: 'VIP', label: '6', status: 'AVAILABLE', price: 180 },
    { id: 'A7', row: 'A', section: 'VIP', label: '7', status: 'RESERVED', price: 180 },
    { id: 'A8', row: 'A', section: 'VIP', label: '8', status: 'AVAILABLE', price: 180 },
    { id: 'A9', row: 'A', section: 'VIP', label: '9', status: 'AVAILABLE', price: 180 },
    { id: 'A10', row: 'A', section: 'VIP', label: '10', status: 'AVAILABLE', price: 180 },
    { id: 'A11', row: 'A', section: 'VIP', label: '11', status: 'AVAILABLE', price: 180 },
    { id: 'A12', row: 'A', section: 'VIP', label: '12', status: 'AVAILABLE', price: 180 },
  ],
  B: [
    { id: 'B1', row: 'B', section: 'Premium', label: '1', status: 'AVAILABLE', price: 145 },
    { id: 'B2', row: 'B', section: 'Premium', label: '2', status: 'AVAILABLE', price: 145 },
    { id: 'B3', row: 'B', section: 'Premium', label: '3', status: 'RESERVED', price: 145 },
    { id: 'B4', row: 'B', section: 'Premium', label: '4', status: 'AVAILABLE', price: 145 },
    { id: 'B5', row: 'B', section: 'Premium', label: '5', status: 'AVAILABLE', price: 145 },
    { id: 'B6', row: 'B', section: 'Premium', label: '6', status: 'AVAILABLE', price: 145 },
    { id: 'B7', row: 'B', section: 'Premium', label: '7', status: 'RESERVED', price: 145 },
    { id: 'B8', row: 'B', section: 'Premium', label: '8', status: 'AVAILABLE', price: 145 },
    { id: 'B9', row: 'B', section: 'Premium', label: '9', status: 'AVAILABLE', price: 145 },
    { id: 'B10', row: 'B', section: 'Premium', label: '10', status: 'AVAILABLE', price: 145 },
    { id: 'B11', row: 'B', section: 'Premium', label: '11', status: 'AVAILABLE', price: 145 },
    { id: 'B12', row: 'B', section: 'Premium', label: '12', status: 'AVAILABLE', price: 145 },
  ],
  C: [
    { id: 'C1', row: 'C', section: 'Standard', label: '1', status: 'AVAILABLE', price: 115 },
    { id: 'C2', row: 'C', section: 'Standard', label: '2', status: 'RESERVED', price: 115 },
    { id: 'C3', row: 'C', section: 'Standard', label: '3', status: 'AVAILABLE', price: 115 },
    { id: 'C4', row: 'C', section: 'Standard', label: '4', status: 'AVAILABLE', price: 115 },
    { id: 'C5', row: 'C', section: 'Standard', label: '5', status: 'AVAILABLE', price: 115 },
    { id: 'C6', row: 'C', section: 'Standard', label: '6', status: 'AVAILABLE', price: 115 },
    { id: 'C7', row: 'C', section: 'Standard', label: '7', status: 'AVAILABLE', price: 115 },
    { id: 'C8', row: 'C', section: 'Standard', label: '8', status: 'AVAILABLE', price: 115 },
    { id: 'C9', row: 'C', section: 'Standard', label: '9', status: 'AVAILABLE', price: 115 },
    { id: 'C10', row: 'C', section: 'Standard', label: '10', status: 'AVAILABLE', price: 115 },
    { id: 'C11', row: 'C', section: 'Standard', label: '11', status: 'AVAILABLE', price: 115 },
    { id: 'C12', row: 'C', section: 'Standard', label: '12', status: 'AVAILABLE', price: 115 },
  ],
  D: [
    { id: 'D1', row: 'D', section: 'Standard', label: '1', status: 'AVAILABLE', price: 115 },
    { id: 'D2', row: 'D', section: 'Standard', label: '2', status: 'AVAILABLE', price: 115 },
    { id: 'D3', row: 'D', section: 'Standard', label: '3', status: 'AVAILABLE', price: 115 },
    { id: 'D4', row: 'D', section: 'Standard', label: '4', status: 'AVAILABLE', price: 115 },
    { id: 'D5', row: 'D', section: 'Standard', label: '5', status: 'RESERVED', price: 115 },
    { id: 'D6', row: 'D', section: 'Standard', label: '6', status: 'AVAILABLE', price: 115 },
    { id: 'D7', row: 'D', section: 'Standard', label: '7', status: 'AVAILABLE', price: 115 },
    { id: 'D8', row: 'D', section: 'Standard', label: '8', status: 'AVAILABLE', price: 115 },
    { id: 'D9', row: 'D', section: 'Standard', label: '9', status: 'AVAILABLE', price: 115 },
    { id: 'D10', row: 'D', section: 'Standard', label: '10', status: 'AVAILABLE', price: 115 },
    { id: 'D11', row: 'D', section: 'Standard', label: '11', status: 'AVAILABLE', price: 115 },
    { id: 'D12', row: 'D', section: 'Standard', label: '12', status: 'AVAILABLE', price: 115 },
  ],
};

const allSeats = Object.values(seatLayout).flat();

export function SeatSelection() {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  const handleSeatClick = (id: string) => {
    setSelectedSeatIds((current) => (current.includes(id) ? current.filter((seatId) => seatId !== id) : [...current, id]));
  };

  const selectedSeats = useMemo(() => allSeats.filter((seat) => selectedSeatIds.includes(seat.id)), [selectedSeatIds]);
  const subtotal = useMemo(() => selectedSeats.reduce((sum, seat) => sum + seat.price, 0), [selectedSeats]);

  return (
    <main className="min-h-screen bg-[#f6efe4] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_25px_80px_-55px_rgba(15,23,42,0.25)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.32em] text-amber-900">
                Seat selection
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Book your premium seats</h1>
              <p className="max-w-xl text-base leading-7 text-slate-600">
                Select the best seats for the evening and review your order in the right-hand summary panel. Reserved seats are locked and unavailable.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Event</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">Neon Nights</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">When</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">Oct 18, 2026</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Venue</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">Aurora Hall</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_0.85fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Select your seats</h2>
                <p className="mt-2 text-sm text-slate-500">Tap any available seat in the map below.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Available
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-500" /> Occupied
                </div>
                <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-900" /> Selected
                </div>
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#f8f1e9] p-6">
              <div className="mx-auto mb-6 flex h-12 w-full max-w-2xl items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-900 tracking-[0.28em] shadow-sm">
                STAGE
              </div>
              <div className="space-y-4">
                {Object.entries(seatLayout).map(([row, rowSeats]) => (
                  <div key={row} className="flex items-center gap-3">
                    <span className="w-8 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">{row}</span>
                    <div className="grid flex-1 grid-cols-[repeat(12,_minmax(0,1fr))] gap-3">
                      {rowSeats.map((seat) => {
                        const isSelected = selectedSeatIds.includes(seat.id);
                        const disabled = seat.status === 'RESERVED';
                        const baseClass = disabled
                          ? 'border-slate-200 bg-slate-300 text-slate-500 cursor-not-allowed'
                          : isSelected
                          ? 'border-amber-900 bg-amber-900 text-white shadow-[0_15px_35px_-20px_rgba(217,119,6,0.45)]'
                          : 'border-slate-200 bg-white text-slate-900 hover:border-amber-300 hover:bg-amber-50';

                        return (
                          <button
                            key={seat.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => handleSeatClick(seat.id)}
                            className={`min-h-[3rem] rounded-3xl border px-2 text-sm font-semibold transition ${baseClass}`}
                          >
                            {seat.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)]">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Order summary</p>
                <h2 className="text-2xl font-semibold text-slate-900">Your selection</h2>
              </div>
              <div className="rounded-[1.75rem] border border-slate-200 bg-[#faf5ef] p-5">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Selected seats</span>
                  <span>{selectedSeatIds.length}</span>
                </div>
                <div className="mt-4 space-y-3">
                  {selectedSeats.length === 0 ? (
                    <p className="text-sm text-slate-500">No seats selected yet. Choose from the map to add them here.</p>
                  ) : (
                    selectedSeats.map((seat) => (
                      <div key={seat.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">{seat.section} • Row {seat.row}</p>
                            <p className="text-sm text-slate-500">Seat {seat.label}</p>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">${seat.price}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-5 text-sm text-slate-800">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span>Service fee</span>
                <span>$9.00</span>
              </div>
              <div className="mt-4 border-t border-slate-200 pt-4 text-lg font-semibold text-slate-900 flex items-center justify-between">
                <span>Total</span>
                <span>${(subtotal + 9).toFixed(2)}</span>
              </div>
            </div>

            <button className="mt-6 w-full rounded-[1.75rem] bg-amber-900 px-5 py-4 text-base font-semibold text-white shadow-[0_15px_35px_-20px_rgba(217,119,6,0.45)] transition hover:bg-amber-800">
              Continue to checkout
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
