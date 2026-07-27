'use client';

import React, { useMemo, useState } from 'react';
import type { CheckoutPayload } from '@/lib/checkoutStorage';

interface PromoInfo {
  _id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumPurchase?: number;
  description?: string;
}

type Props = {
  payload: CheckoutPayload;
  onSubmit: (
    customer: { fullName: string; email: string; phone: string },
    payment: { method: 'CARD' | 'MOCK' },
    promo?: PromoInfo
  ) => Promise<void>;
  onBack?: () => void;
  processing?: boolean;
};

export default function CheckoutForm({ payload, onSubmit, onBack, processing = false }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState<'CARD' | 'MOCK'>('CARD');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<PromoInfo | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const subtotal = useMemo(() => payload.seats.reduce((s, seat) => s + seat.price, 0), [payload]);

  const discount = useMemo(() => {
    if (!promo) return 0;
    if (promo.discountType === 'PERCENTAGE') {
      return subtotal * (promo.discountValue / 100);
    }
    return promo.discountValue;
  }, [promo, subtotal]);

  const total = subtotal + 9 - discount;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required';
    if (!phone.trim()) e.phone = 'Phone number is required';

    // CARD payments are collected on Stripe's own hosted Checkout page, not
    // here — we only need the buyer's contact details before redirecting.

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyPromo = async () => {
    const code = promoInput.trim();
    if (!code) { setPromoError('Enter a promo code'); return; }

    setPromoLoading(true);
    setPromoError(null);

    try {
      const res = await fetch(`/api/promocodes/validate?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!data.valid) {
        setPromoError(data.message || 'Invalid promo code');
        setPromo(null);
        return;
      }

      if (data.minimumPurchase && subtotal < data.minimumPurchase) {
        setPromoError(`Minimum purchase of $${data.minimumPurchase} required`);
        setPromo(null);
        return;
      }

      setPromo(data);
    } catch {
      setPromoError('Failed to validate promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromo(null);
    setPromoInput('');
    setPromoError(null);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ fullName, email, phone }, { method }, promo ?? undefined);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitting = loading || processing;

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900">Payment Details</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your payment and contact information.</p>
        </div>
        <div className="flex gap-2 text-slate-400">
          <span className="material-symbols-outlined">credit_card</span>
          <span className="material-symbols-outlined">account_balance_wallet</span>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Full name</label>
          <input className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-amber-900 focus:ring-2 focus:ring-amber-100" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          {errors.fullName ? <p className="text-sm text-red-600">{errors.fullName}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Email</label>
          <input className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-amber-900 focus:ring-2 focus:ring-amber-100" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Phone</label>
          <input className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-amber-900 focus:ring-2 focus:ring-amber-100" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {errors.phone ? <p className="text-sm text-red-600">{errors.phone}</p> : null}
        </div>

        <div className="border-t border-slate-200 pt-2" />

        {/* Promo Code */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Promo Code</label>
          {promo ? (
            <div className="flex items-center justify-between rounded-lg border border-green-300 bg-green-50 px-4 py-3">
              <div>
                <span className="font-semibold text-green-800">{promo.code}</span>
                <span className="ml-2 text-sm text-green-700">
                  ({promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% off` : `-$${promo.discountValue}`})
                </span>
                {promo.description && <p className="text-xs text-green-600 mt-0.5">{promo.description}</p>}
              </div>
              <button type="button" onClick={handleRemovePromo} className="text-sm font-semibold text-red-600 hover:underline">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-amber-900 focus:ring-2 focus:ring-amber-100 uppercase"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={promoLoading}
                className="rounded-lg border border-amber-900 px-4 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-50 disabled:opacity-50"
              >
                {promoLoading ? '...' : 'Apply'}
              </button>
            </div>
          )}
          {promoError && <p className="text-sm text-red-600">{promoError}</p>}
        </div>

        <div className="border-t border-slate-200 pt-2" />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Payment method</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setMethod('CARD')} className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${method === 'CARD' ? 'border-amber-900 bg-amber-50 text-amber-900' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}>Card (Stripe)</button>
            <button type="button" onClick={() => setMethod('MOCK')} className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${method === 'MOCK' ? 'border-amber-900 bg-amber-50 text-amber-900' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}>Mock</button>
          </div>
        </div>

        {method === 'CARD' ? (
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <span className="material-symbols-outlined text-amber-900">lock</span>
            <p className="text-sm text-slate-600">
              You&apos;ll be redirected to Stripe&apos;s secure, hosted checkout to enter your card details. We never see or
              store your card number.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <span className="material-symbols-outlined text-slate-500">science</span>
            <p className="text-sm text-slate-600">
              Mock payment for testing — confirms the booking immediately without going through Stripe.
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 py-2">
          <input type="checkbox" id="billing" checked readOnly className="h-5 w-5 rounded border-slate-300 text-amber-900 focus:ring-amber-900" />
          <label className="text-sm text-slate-600" htmlFor="billing">Billing address same as shipping</label>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <button type="button" onClick={onBack} className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Back</button>
          <button type="button" disabled={isSubmitting} onClick={handleSubmit} className="flex items-center justify-center gap-2 rounded-lg bg-amber-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            ) : null}
            Confirm & Continue — ${total.toFixed(2)}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 pt-6 text-sm font-medium text-slate-500">
          <span className="material-symbols-outlined text-amber-900">verified_user</span>
          <span>256-bit SSL Encrypted Payment</span>
        </div>
      </div>
    </form>
  );
}
