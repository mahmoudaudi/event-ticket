'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CheckoutForm from '@/components/CheckoutForm';
import CheckoutSummary from '@/components/CheckoutSummary';
import { loadCheckout, clearCheckout, CheckoutPayload } from '@/lib/checkoutStorage';

const fallbackPayload: CheckoutPayload = {
  event: {
    _id: 'demo-event',
    title: 'Executive Leadership Summit 2024',
    venue: 'Grand Metropolitan Hall',
    eventDate: '2024-10-24',
    startTime: '09:00 AM EST',
    endTime: '05:00 PM EST',
  },
  seats: [
    { id: 'seat-1', row: 'A', section: 'Standard Delegate Pass', label: '1', price: 1199 },
    { id: 'seat-2', row: 'A', section: 'Standard Delegate Pass', label: '2', price: 1199 },
  ],
  subtotal: 2398,
  createdAt: new Date().toISOString(),
};

export default function CheckoutPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<CheckoutPayload | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const p = loadCheckout();
    setPayload(p ?? fallbackPayload);
  }, []);

  const handleBack = () => router.back();

  const handleSubmit = async (_customer: any, _payment: any) => {
    setProcessing(true);
    try {
      await new Promise((res) => setTimeout(res, 1400));
      clearCheckout();
      setShowSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setProcessing(false);
    }
  };

  const pageTitle = useMemo(() => {
    if (!payload) return 'Checkout | EventPremium';
    return `${payload.event.title} | Checkout | EventPremium`;
  }, [payload]);

  if (!payload) return null;

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

        {!showSuccess ? (
          <div id="checkout-flow" className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-7">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Secure Checkout</h1>
                <p className="text-base text-slate-600">Complete your reservation for the selected event.</p>
              </div>

              <div className="rounded-3xl border border-[#d9cfbf] bg-white p-8 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.12)]">
                <CheckoutForm payload={payload} onSubmit={handleSubmit} onBack={handleBack} processing={processing} />
              </div>
            </div>

            <div className="lg:col-span-5">
              <CheckoutSummary event={payload.event} seats={payload.seats} fee={9} />
            </div>
          </div>
        ) : (
          <div id="success-state" className="mx-auto max-w-3xl py-12 text-center">
            <div className="relative mx-auto h-32 w-32">
              <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping" />
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-amber-900 text-white">
                <span className="material-symbols-outlined text-6xl" style={{ fontVariationSettings: `'FILL' 1` }}>check_circle</span>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <h2 className="text-5xl font-bold tracking-tight text-slate-900">Booking Confirmed!</h2>
              <p className="text-lg text-slate-600">Your reservation is secure. A confirmation email has been sent to your primary address.</p>
            </div>
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row">
              <div className="space-y-1 text-left">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Booking Reference</span>
                <p className="font-mono text-xl font-semibold text-slate-900">EP-8829-XL7</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Get Receipt</button>
                <button className="rounded-lg bg-amber-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800">Add to Calendar</button>
              </div>
            </div>
            <div className="mt-8">
              <a className="text-sm font-semibold text-amber-900 underline" href="#">Return to Browse Events</a>
            </div>
          </div>
        )}
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
