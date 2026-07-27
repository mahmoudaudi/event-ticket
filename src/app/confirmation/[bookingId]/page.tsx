'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface ReservedSeat {
  _id: string;
  seatId: string;
  section: string;
  row: string;
  seatNumber: string;
  price: number;
}

interface Ticket {
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface BookingData {
  _id: string;
  bookingReference: string;
  paymentStatus: string;
  bookingStatus: string;
  total: number;
  subtotal: number;
  discount: number;
  qrCode: string;
  createdAt: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  event: {
    _id: string;
    title: string;
    venue: string;
    address: string;
    city: string;
    eventDate: string;
    startTime: string;
    endTime: string;
    bannerImage: string;
  } | null;
  tickets: Ticket[];
  reservedSeats: ReservedSeat[];
  promoCode: {
    code: string;
    discount: number;
  } | null;
}

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('Booking ID is missing');
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch booking: ${response.statusText}`);
        }

        const data = await response.json();
        setBooking(data);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError((err as Error).message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6efe4]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
          <p className="mt-4 text-slate-600">Loading your booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6efe4]">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'Unable to load your booking details.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const eventDate = booking.event?.eventDate ? formatDate(booking.event.eventDate) : 'TBA';
  const totalTickets = booking.tickets.reduce((sum, t) => sum + t.quantity, 0);
  const fee = booking.subtotal - booking.discount - (booking.total - booking.subtotal) < 0 ? 0 : booking.subtotal + booking.discount - booking.total;

  return (
    <div className="min-h-screen bg-[#f6efe4] text-slate-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/90 shadow-[0px_4px_20px_rgba(30,41,59,0.05)] backdrop-blur">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="cursor-pointer text-2xl font-bold text-amber-900">Aurum</span>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-900">verified</span>
            <span className="text-sm font-medium text-slate-600">Booking Confirmed</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        {/* Success Animation */}
        <div className="mb-12 flex justify-center">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-amber-900/10 rounded-full animate-pulse"></div>
            <div className="relative w-32 h-32 bg-gradient-to-br from-amber-900 to-amber-700 text-white rounded-full flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mb-12 text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">Booking Confirmed!</h1>
          <p className="text-lg text-slate-600">
            Your reservation is secure. A confirmation email has been sent to{' '}
            <span className="font-semibold text-slate-900">{booking.user?.email}</span>
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event & Seats Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Reference Card */}
            <div className="rounded-2xl border border-[#d9cfbf] bg-white p-8 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.12)]">
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                    Booking Reference
                  </span>
                  <p className="mt-2 text-3xl font-mono font-bold text-amber-900">
                    {booking.bookingReference}
                  </p>
                </div>

                <div className="h-px bg-[#d9cfbf]"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Payment Status
                    </span>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                        <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                        {booking.paymentStatus === 'PAID' ? 'Paid' : booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Booking Status
                    </span>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                        <span className="material-symbols-outlined text-sm mr-1">calendar_check</span>
                        {booking.bookingStatus === 'CONFIRMED' ? 'Confirmed' : booking.bookingStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="rounded-2xl border border-[#d9cfbf] bg-white overflow-hidden shadow-[0_12px_40px_-24px_rgba(15,23,42,0.12)]">
              {/* Event Image */}
              <div className="relative h-64 bg-slate-200">
                {booking.event?.bannerImage && (
                  <img
                    src={booking.event.bannerImage}
                    alt={booking.event.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                  <h2 className="text-2xl font-bold text-white">{booking.event?.title}</h2>
                </div>
              </div>

              {/* Event Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-amber-900 flex-shrink-0 mt-1">
                    calendar_month
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Event Date & Time</p>
                    <p className="text-lg font-semibold text-slate-900">{eventDate}</p>
                    {booking.event?.startTime && (
                      <p className="text-sm text-slate-600">{booking.event.startTime}</p>
                    )}
                  </div>
                </div>

                <div className="h-px bg-[#d9cfbf]"></div>

                <div className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-amber-900 flex-shrink-0 mt-1">
                    location_on
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Venue</p>
                    <p className="text-lg font-semibold text-slate-900">{booking.event?.venue}</p>
                    {booking.event?.address && (
                      <p className="text-sm text-slate-600">{booking.event.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seats Card */}
            <div className="rounded-2xl border border-[#d9cfbf] bg-white p-6 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.12)]">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Reserved Seats</h3>
              <div className="space-y-2">
                {booking.reservedSeats.map((seat) => (
                  <div key={seat._id} className="flex justify-between items-center py-2 border-b border-[#e5ddd4] last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {seat.section} • Row {seat.row} • Seat {seat.seatNumber}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-amber-900">{formatCurrency(seat.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code Card */}
            {booking.qrCode && (
              <div className="rounded-2xl border border-[#d9cfbf] bg-white p-6 flex flex-col items-center shadow-[0_12px_40px_-24px_rgba(15,23,42,0.12)]">
                <p className="text-sm font-semibold text-slate-600 mb-4">QR Code</p>
                <img
                  src={booking.qrCode}
                  alt="Booking QR Code"
                  className="w-40 h-40 border-4 border-[#d9cfbf] rounded-lg"
                />
                <p className="text-xs text-slate-500 mt-4 text-center">
                  Show this QR code at the event entrance
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-2xl border border-[#d9cfbf] bg-white p-6 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.12)] space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Order Summary</h3>

              <div className="space-y-3">
                {booking.tickets.map((ticket, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-600">
                      {ticket.quantity}x Ticket{ticket.quantity > 1 ? 's' : ''}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {formatCurrency(ticket.totalPrice)}
                    </span>
                  </div>
                ))}

                <div className="h-px bg-[#d9cfbf]"></div>

                {fee > 0 && (
                  <>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-600">Booking Fee</span>
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(fee)}</span>
                    </div>
                  </>
                )}

                {booking.discount > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-600">Discount</span>
                    <span className="text-sm font-semibold text-green-600">
                      -{formatCurrency(booking.discount)}
                    </span>
                  </div>
                )}

                <div className="h-px bg-[#d9cfbf]"></div>

                <div className="flex justify-between items-center py-3">
                  <span className="font-semibold text-slate-900">Total Amount</span>
                  <span className="text-2xl font-bold text-amber-900">{formatCurrency(booking.total)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 space-y-3 border-t border-[#d9cfbf]">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>Secure Transaction</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>256-bit SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              // Download ticket functionality (UI only for now)
              const bookingInfo = `Booking Reference: ${booking.bookingReference}\nEvent: ${booking.event?.title}\nDate: ${eventDate}\nTotal: ${formatCurrency(booking.total)}`;
              const element = document.createElement('a');
              element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(bookingInfo));
              element.setAttribute('download', `ticket-${booking.bookingReference}.txt`);
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }}
            className="px-8 py-3 border-2 border-amber-900 text-amber-900 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            <span className="material-symbols-outlined">download</span>
            Download Ticket
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors flex items-center justify-center gap-2 font-semibold"
          >
            <span className="material-symbols-outlined">home</span>
            Return to Home
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-12 max-w-2xl mx-auto text-center">
          <p className="text-slate-600 mb-2">Need help with your booking?</p>
          <a href="#" className="text-amber-900 font-semibold hover:underline">
            Visit Help Center
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-[#d9cfbf] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Aurum</p>
              <p className="text-xs text-slate-600 mt-2">Elevating the event discovery and booking experience.</p>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Platform</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li><a href="#" className="hover:text-amber-900">Browse Events</a></li>
                  <li><a href="#" className="hover:text-amber-900">Help Center</a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Legal</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li><a href="#" className="hover:text-amber-900">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-amber-900">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-[#d9cfbf] pt-8">
            <p className="text-center text-xs text-slate-600">© 2024 Aurum. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
