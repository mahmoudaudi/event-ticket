"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<"link" | "otp" | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async (chosen: "link" | "otp") => {
    setMethod(chosen);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, method: chosen }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setSent(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-display font-extrabold tracking-tight text-primary">
            Event<span className="text-primary-container">Premium</span>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50">
          {sent ? (
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-primary mb-3">
                {method === "otp" ? "sms" : "mark_email_read"}
              </span>
              <h1 className="text-lg font-semibold font-headline text-on-surface mb-2">Check your email</h1>
              <p className="text-sm text-on-surface-variant">
                {method === "otp"
                  ? `We've sent a 6-digit code to ${email}.`
                  : `We've sent a reset link to ${email}.`}
              </p>
              {method === "otp" && (
                <button
                  onClick={() => router.push(`/verify-otp?email=${encodeURIComponent(email)}`)}
                  className="mt-6 w-full bg-primary text-on-primary py-2 rounded-xl text-sm font-medium hover:brightness-110 transition-all cursor-pointer"
                >
                  Enter OTP Code
                </button>
              )}
              <Link href="/login" className="mt-3 inline-block text-sm text-primary font-medium hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-semibold font-headline text-on-surface text-center mb-1">Forgot password?</h1>
              <p className="text-sm text-on-surface-variant text-center mb-5">
                Enter your email and choose how to reset.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-on-surface mb-1">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)}
                    type="email" placeholder="m@example.com" required
                    className="w-full px-3.5 py-2 rounded-xl border border-outline-variant bg-white/60 text-sm text-on-surface placeholder:text-outline/60 outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10" />
                </div>

                {error && <p className="text-[11px] text-error text-center">{error}</p>}

                <button onClick={() => handleSend("link")} disabled={loading || !email}
                  className="w-full bg-primary text-on-primary py-2 rounded-xl text-sm font-medium hover:brightness-110 active:brightness-95 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading && method === "link" ? "Sending..." : "Send Reset Link"}
                </button>

                <button onClick={() => handleSend("otp")} disabled={loading || !email}
                  className="w-full border border-outline-variant text-on-surface py-2 rounded-xl text-sm font-medium hover:bg-surface-container transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  {loading && method === "otp" ? "Sending..." : "Send OTP Code"}
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-on-surface-variant">
                <Link href="/login" className="text-primary font-medium hover:underline">Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
