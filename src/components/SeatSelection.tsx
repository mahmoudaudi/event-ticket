'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { saveCheckout } from '@/lib/checkoutStorage';

interface Event {
  _id: string;
  title: string;
  venue: string;
  eventDate: string;
  startTime: string;
  endTime: string;
}

interface Seat {
  id: string;
  row: string;
  section: string;
  label: string;
  status: 'AVAILABLE' | 'RESERVED';
  price: number;
}

interface ApiSeat {
  _id: string;
  row: string;
  seatNumber: string | number;
  section: string;
  status: 'AVAILABLE' | 'RESERVED';
  price: number;
}

interface SeatApiResponse {
  event: Event;
  seats: ApiSeat[];
}

export function SeatSelection() {
  const params = useParams();
  const eventId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : 'demo-event';

  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [reserveLoading, setReserveLoading] = useState(false);

  const reserveSeats = async () => {
    // kept for backward compatibility — do not call on Continue to checkout
    if (selectedSeatIds.length === 0) {
      setReservationError('Please select at least one seat.');
      return;
    }

    setReservationError(null);
    setReserveLoading(true);

    try {
      const response = await fetch(`/api/events/${eventId}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ seatIds: selectedSeatIds }),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          setSeats((currentSeats) =>
            currentSeats.map((seat) =>
              selectedSeatIds.includes(seat.id) ? { ...seat, status: 'RESERVED' } : seat
            )
          );
          setSelectedSeatIds([]);
          setReservationError(null);
          return;
        }

        setReservationError(data.message ?? 'Unable to reserve seats. Please try again.');
        return;
      }

      if (response.status === 409) {
        setReservationError('Some selected seats were just reserved by another customer.');
        setSelectedSeatIds([]);
        await fetchSeats();
        return;
      }

      const responseData = await response.json().catch(() => null);
      setReservationError(
        responseData?.message ?? 'Unable to reserve seats. Please try again later.'
      );
    } catch {
      setReservationError('Unable to reserve seats. Please try again.');
    } finally {
      setReserveLoading(false);
    }
  };

  const fetchSeats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${eventId}/seats`);

      if (!response.ok) {
        setError('Unable to load event data. Please try again later.');
        return;
      }

      const data = (await response.json()) as SeatApiResponse;

      setEvent(data.event);
      setSeats(
        data.seats.map((seat) => ({
          id: seat._id,
          row: seat.row,
          section: seat.section,
          label: String(seat.seatNumber),
          status: seat.status,
          price: seat.price,
        }))
      );
    } catch {
      setError('Unable to load event data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void fetchSeats();
  }, [fetchSeats]);

  const router = useRouter();

  const handleContinueToCheckout = () => {
    if (!event) {
      setReservationError('Event data not loaded yet.');
      return;
    }

    if (selectedSeats.length === 0) {
      setReservationError('Please select at least one seat.');
      return;
    }

    const payload = {
      event: {
        _id: event._id,
        title: event.title,
        venue: event.venue,
        eventDate: event.eventDate,
        startTime: event.startTime,
        endTime: event.endTime,
      },
      seats: selectedSeats.map((s) => ({ id: s.id, row: s.row, section: s.section, label: s.label, price: s.price })),
      subtotal,
      createdAt: new Date().toISOString(),
    };

    try {
      saveCheckout(payload);
      router.push('/checkout');
    } catch (e) {
      setReservationError('Unable to proceed to checkout. Please try again.');
    }
  };
  

  const seatLayout = useMemo(() => {
    return seats.reduce<Record<string, Seat[]>>((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }

      acc[seat.row].push(seat);
      return acc;
    }, {});
  }, [seats]);

  const groupedRows = useMemo(() => {
    return Object.entries(seatLayout).sort(([a], [b]) => a.localeCompare(b));
  }, [seatLayout]);

  const formattedEventInfo = useMemo(() => {
    if (!event) {
      return '';
    }

    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(event.eventDate));

    return `${formattedDate} • ${event.startTime} - ${event.endTime}`;
  }, [event]);

  const handleSeatClick = (id: string) => {
    setSelectedSeatIds((current) => (current.includes(id) ? current.filter((seatId) => seatId !== id) : [...current, id]));
  };

  const selectedSeats = useMemo(() => seats.filter((seat) => selectedSeatIds.includes(seat.id)), [seats, selectedSeatIds]);
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
                <p className="mt-3 text-lg font-semibold text-slate-900">{loading ? 'Loading...' : event?.title ?? 'Event unavailable'}</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">When</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{loading ? 'Loading...' : event ? formattedEventInfo : 'Date unavailable'}</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Venue</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{loading ? 'Loading...' : event?.venue ?? 'Venue unavailable'}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.55fr_0.85fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)]">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Select your seats</h2>
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
                {error ? (
                  <p className="text-sm text-red-600">{error}</p>
                ) : seats.length === 0 && !loading ? (
                  <p className="text-sm text-slate-500">No seats available for this event.</p>
                ) : (
                  groupedRows.map(([row, rowSeats]) => (
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
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.15)]">
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-slate-400">Order summary</p>
                <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Your selection</h2>
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

            {reservationError ? (
              <p className="mt-4 text-sm text-red-600">{reservationError}</p>
            ) : null}

            <button
              type="button"
              disabled={selectedSeatIds.length === 0}
              onClick={handleContinueToCheckout}
              className="mt-6 w-full rounded-[1.75rem] bg-amber-900 px-5 py-4 text-base font-semibold text-white shadow-[0_15px_35px_-20px_rgba(217,119,6,0.45)] transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to checkout
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
