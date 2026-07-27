'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { clearCheckout } from '@/lib/checkoutStorage';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('Missing checkout session. If you completed payment, check My Bookings.');
      return;
    }

    let cancelled = false;

    fetch('/api/checkout/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || 'Could not confirm your payment.');
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        clearCheckout();
        router.replace(`/confirmation/${data.bookingId}`);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not confirm your payment.');
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 text-center">
        <div>
          <div className="mb-4 text-5xl">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment confirmation failed</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push('/checkout')}
              className="px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Checkout
            </button>
            <button
              onClick={() => router.push('/bookings')}
              className="px-6 py-3 bg-amber-900 text-white rounded-lg font-semibold hover:bg-amber-800"
            >
              My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900" />
        <p className="mt-4 text-slate-600">Confirming your payment...</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
