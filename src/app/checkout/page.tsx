'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';
import CheckoutSummary from '@/components/CheckoutSummary';
import { loadCheckout, clearCheckout, CheckoutPayload } from '@/lib/checkoutStorage';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [payload, setPayload] = useState<CheckoutPayload | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/login?callbackUrl=/checkout');
      return;
    }
    const p = loadCheckout();
    if (!p) {
      setError('No checkout session found. Please select seats and try again.');
      return;
    }
    setPayload(p);
  }, [authLoading, user, router]);

  const handleBack = () => router.back();

  const handleSubmit = async (_customer: any, _payment: any) => {
    setProcessing(true);
    setError(null);
    
    try {
      if (!payload) {
        throw new Error('Checkout session expired. Please start over.');
      }

      // Validate required checkout data
      if (!payload.event?._id) {
        throw new Error('Event information is missing.');
      }

      if (!payload.seats || payload.seats.length === 0) {
        throw new Error('No seats selected.');
      }

      // Simulate payment processing
      await new Promise((res) => setTimeout(res, 1400));

      // Prepare booking data using REAL values from checkout payload
      const seatIds = payload.seats.map((s) => s.id); // Real MongoDB ObjectIds
      const bookingFee = 9;
      const totalAmount = payload.subtotal + bookingFee;

      // Create booking record with real data
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: payload.event._id, // Real MongoDB ObjectId
          seatIds, // Real MongoDB ObjectIds from seat selection
          tickets: [
            {
              // Use event title + section as ticket type identifier
              ticketTypeId: payload.event._id, // Reference to event as ticket type
              quantity: payload.seats.length,
              unitPrice: payload.seats[0]?.price || 0,
              totalPrice: payload.subtotal,
            },
          ],
          subtotal: payload.subtotal,
          discount: 0,
          total: totalAmount,
        }),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const bookingData = await bookingResponse.json();
      
      if (!bookingData.booking?._id) {
        throw new Error('Booking creation failed: Invalid response from server');
      }

      // Clear checkout session
      clearCheckout();

      // Redirect to confirmation page with booking ID
      router.push(`/confirmation/${bookingData.booking._id}`);
    } catch (err) {
      console.error('Error during checkout:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const pageTitle = 'Checkout | EventPremium';

  // Show error state if no payload or error occurred
  if (!payload) {
    return (
      <div className="min-h-screen bg-[#f6efe4] text-slate-900">
        <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/90 shadow-[0px_4px_20px_rgba(30,41,59,0.05)] backdrop-blur">
          <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <span className="cursor-pointer text-2xl font-bold text-amber-900">EventPremium</span>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md rounded-3xl border border-[#d9cfbf] bg-white p-8 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.12)] text-center">
            <div className="mb-4 text-5xl">⚠️</div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">No Session Found</h2>
            <p className="mb-6 text-slate-600">
              {error || 'Your checkout session has expired or is invalid.'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="rounded-lg bg-amber-900 px-6 py-3 font-semibold text-white transition hover:bg-amber-800"
            >
              Return to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6efe4] text-slate-900">
      <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-white/90 shadow-[0px_4px_20px_rgba(30,41,59,0.05)] backdrop-blur">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <span className="cursor-pointer text-2xl font-bold text-amber-900">EventPremium</span>
            <div className="hidden gap-5 md:flex">
              <a className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-900" href="#">Browse</a>
              <a className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-900" href="#">Categories</a>
              <a className="text-sm font-medium text-slate-600 transition-colors hover:text-amber-900" href="#">Venues</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <div className="relative">
                
                <input className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none ring-0" placeholder="Search events..." type="text" />
              </div>
            </div>
            <button className="material-symbols-outlined rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100">notifications</button>
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-slate-200">
              <img className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLkrEuH6peRv5d532W2tYzGZnK_JGHMefZgvQtGiBrNcAOZLLnETz2iZUcmNXz9AwqJW7B1AVnwq1M3BPNVMl4tCuFpvs8C8SJ1cacBaxzy8cWMMcd2npJGp3w5oGPH833iRoXacsSlaNZ5Aa4MYyceNH774n6W8reLjVeaVu2PLji62dGSR-zelaoxgVYyRY18_uvWSqoNEfKRu1n-ovjc5x1tLIZUkcNyG_cMCunwtONp-M0vIBSpclT2rq4dRmonkM6Apoxe9M" alt="avatar" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between max-w-md">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-900 text-xs">1</span>
            <span className="text-sm">Review</span>
          </div>
          <div className="mx-4 h-px flex-1 bg-slate-200" />
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-amber-900 text-xs">2</span>
            <span className="text-sm">Payment</span>
          </div>
          <div className="mx-4 h-px flex-1 bg-slate-200" />
          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-300 text-xs">3</span>
            <span className="text-sm">Confirm</span>
          </div>
        </div>

        <div id="checkout-flow" className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Secure Checkout</h1>
              <p className="text-base text-slate-600">Complete your reservation for the selected event.</p>
            </div>

            {error && (
              <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-red-600 flex-shrink-0">error</span>
                  <div>
                    <h3 className="font-semibold text-red-900">Checkout Error</h3>
                    <p className="mt-1 text-sm text-red-800">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="mt-3 text-sm font-semibold text-red-600 hover:text-red-700 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-[#d9cfbf] bg-white p-8 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.12)]">
              <CheckoutForm payload={payload} onSubmit={handleSubmit} onBack={handleBack} processing={processing} />
            </div>
          </div>

          <div className="lg:col-span-5">
            <CheckoutSummary event={payload.event} seats={payload.seats} fee={9} />
          </div>
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:px-8">
          <div className="max-w-xs text-center lg:text-left">
            <span className="text-2xl font-bold text-slate-900">EventPremium</span>
            <p className="mt-3 text-sm text-slate-600">Elevating the event discovery and booking experience for industry professionals worldwide.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-600">
            <div className="space-y-3">
              <span className="block text-xs font-bold uppercase tracking-[0.3em] text-slate-800">Platform</span>
              <a className="block hover:text-amber-900" href="#">Help Center</a>
              <a className="block hover:text-amber-900" href="#">Terms of Service</a>
            </div>
            <div className="space-y-3">
              <span className="block text-xs font-bold uppercase tracking-[0.3em] text-slate-800">Legal</span>
              <a className="block hover:text-amber-900" href="#">Privacy Policy</a>
              <a className="block hover:text-amber-900" href="#">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
