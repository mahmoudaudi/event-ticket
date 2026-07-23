"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { AuthAlert } from "@/components/Toast";

function VerifyOTPForm() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const verifyOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      login(data.token, data.user);
      window.location.href = "/";
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-xl font-semibold font-headline text-on-surface text-center mb-1">Enter OTP</h1>
      <p className="text-sm text-on-surface-variant text-center mb-5">
        We sent a 6-digit code to <strong className="text-on-surface">{email}</strong>
        <br />
        <span className="text-outline">Expires in 2 minutes</span>
      </p>

      <div className="space-y-3">
        <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          type="text" inputMode="numeric" placeholder="000000" maxLength={6}
          className="w-full px-3.5 py-3 rounded-xl border border-outline-variant bg-white/60 text-on-surface placeholder:text-outline/60 outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 text-center text-2xl tracking-[10px]" />

        {error && <AuthAlert message={error} type="error" />}

        <button onClick={verifyOTP} disabled={loading || otp.length !== 6}
          className="w-full bg-primary text-on-primary py-2 rounded-xl text-sm font-medium hover:brightness-110 active:brightness-95 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-on-surface-variant">
        <Link href="/forgot-password" className="text-primary font-medium hover:underline">Resend code</Link>
      </p>
    </>
  );
}

export default function VerifyOTPPage() {
  return (
    <div className="h-screen overflow-hidden bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-display font-extrabold tracking-tight text-primary">
            Aurum
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50">
          <Suspense fallback={<p className="text-sm text-on-surface-variant text-center">Loading...</p>}>
            <VerifyOTPForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
