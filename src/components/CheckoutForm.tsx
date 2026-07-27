'use client';

import React, { useMemo, useState } from 'react';
import type { CheckoutPayload } from '@/lib/checkoutStorage';

type Props = {
  payload: CheckoutPayload;
  onSubmit: (customer: { fullName: string; email: string; phone: string }, payment: { method: string; cardName?: string; cardNumber?: string; expiry?: string; cvv?: string }) => Promise<void>;
  onBack?: () => void;
  processing?: boolean;
};

export default function CheckoutForm({ payload, onSubmit, onBack, processing = false }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [method, setMethod] = useState('CARD');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(() => payload.seats.reduce((s, seat) => s + seat.price, 0), [payload]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required';
    if (!phone.trim()) e.phone = 'Phone number is required';

    if (method === 'CARD') {
      if (!cardNumber.replace(/\s/g, '').match(/^\d{12,19}$/)) e.cardNumber = 'Enter a valid card number';
      if (!expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = 'Enter expiry MM/YY';
      if (!cvv.match(/^\d{3,4}$/)) e.cvv = 'Enter CVV';
      if (!cardName.trim()) e.cardName = 'Cardholder name required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({ fullName, email, phone }, { method, cardName, cardNumber, expiry, cvv });
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

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Payment method</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setMethod('CARD')} className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${method === 'CARD' ? 'border-amber-900 bg-amber-50 text-amber-900' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}>Card</button>
            <button type="button" onClick={() => setMethod('MOCK')} className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${method === 'MOCK' ? 'border-amber-900 bg-amber-50 text-amber-900' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'}`}>Mock</button>
          </div>
        </div>

        {method === 'CARD' ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Card Number</label>
              <div className="relative">
                <input className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono outline-none transition focus:border-amber-900 focus:ring-2 focus:ring-amber-100" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 gap-1">
                  <span className="h-5 w-8 rounded-sm bg-slate-200" />
                  <span className="h-5 w-8 rounded-sm bg-slate-200" />
                </div>
              </div>
              {errors.cardNumber ? <p className="text-sm text-red-600">{errors.cardNumber}</p> : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">Expiry Date</label>
                <input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-amber-900 focus:ring-2 focus:ring-amber-100" />
                {errors.expiry ? <p className="text-sm text-red-600">{errors.expiry}</p> : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">CVV</label>
                <div className="relative">
                  <input placeholder="***" value={cvv} onChange={(e) => setCvv(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-amber-900 focus:ring-2 focus:ring-amber-100" />
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">help</span>
                </div>
                {errors.cvv ? <p className="text-sm text-red-600">{errors.cvv}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Cardholder Name</label>
              <input value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-amber-900 focus:ring-2 focus:ring-amber-100" />
              {errors.cardName ? <p className="text-sm text-red-600">{errors.cardName}</p> : null}
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="billing"
             checked
             readOnly
            className="h-5 w-5 rounded border-slate-300 text-amber-900 focus:ring-amber-900"
/>
          <label className="text-sm text-slate-600" htmlFor="billing">Billing address same as shipping</label>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <button type="button" onClick={onBack} className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Back</button>
          <button type="button" disabled={isSubmitting} onClick={handleSubmit} className="flex items-center justify-center gap-2 rounded-lg bg-amber-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-70">
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            ) : null}
            Confirm & Continue — ${(subtotal + 9).toFixed(2)}
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
