"use client";

import { useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthAlert } from "@/components/Toast";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

  const validate = useCallback((name: string, value: string): string => {
    switch (name) {
      case "password": {
        if (value.length < 8) return "At least 8 characters required";
        if (!/[A-Z]/.test(value)) return "Must include 1 uppercase letter";
        if (!/[^a-zA-Z0-9]/.test(value)) return "Must include 1 symbol";
        return "";
      }
      case "confirm": return value === password ? "" : "Passwords do not match";
      default: return "";
    }
  }, [password]);

  const errors = {
    password: validate("password", password),
    confirm: password ? validate("confirm", confirm) : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleBlur = (name: string) => setTouched((prev) => new Set(prev).add(name));

  const showError = (name: keyof typeof errors) => (touched.has(name) || submitted) && errors[name];

  const inputCls = (name: keyof typeof errors) =>
    `w-full px-3.5 py-2 rounded-xl border text-sm text-on-surface placeholder:text-outline/60 outline-none transition-all duration-200 bg-white/60 focus:ring-2 ${
      showError(name)
        ? "border-error focus:border-error focus:ring-error/10"
        : "border-outline-variant focus:border-primary focus:ring-primary/10"
    }`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const allTouched = new Set(touched);
    ["password", "confirm"].forEach((n) => allTouched.add(n));
    setTouched(allTouched);
    if (hasErrors || !token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setDone(true);
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const passedChecks = (password.length >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasSymbol ? 1 : 0);
  const strength = password.length === 0 ? 0 : passedChecks;

  if (done) {
    return (
      <div className="text-center">
        <span className="material-symbols-outlined text-4xl text-primary mb-3">check_circle</span>
        <h1 className="text-lg font-semibold font-headline text-on-surface mb-2">Password reset!</h1>
        <p className="text-sm text-on-surface-variant mb-6">You can now sign in with your new password.</p>
        <Link href="/login" className="inline-block bg-primary text-on-primary py-2 px-6 rounded-xl text-sm font-medium hover:brightness-110 transition-all cursor-pointer">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-semibold font-headline text-on-surface text-center mb-1">Set new password</h1>
      <p className="text-sm text-on-surface-variant text-center mb-5">Must be at least 8 characters with 1 uppercase and 1 symbol.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-on-surface mb-1">New password</label>
          <div className="relative">
            <input value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => handleBlur("password")}
              type={showPassword ? "text" : "password"} placeholder="New password"
              className={`${inputCls("password")} pr-9`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer" tabIndex={-1}>
              <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          {showError("password") && <p className="text-[11px] text-error mt-1">{errors.password}</p>}
          {password.length > 0 && (
            <div className="mt-1.5 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3].map((l) => (
                  <div key={l} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                    strength === 3 ? "bg-green-600" : strength >= l ? (l <= 1 ? "bg-error" : l === 2 ? "bg-orange-500" : "bg-green-600") : "bg-surface-container"
                  }`} />
                ))}
              </div>
              <p className="text-[11px] text-outline">{strength === 3 ? "Strong password" : ""}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-on-surface mb-1">Confirm password</label>
          <div className="relative">
            <input value={confirm} onChange={(e) => setConfirm(e.target.value)} onBlur={() => handleBlur("confirm")}
              type={showConfirm ? "text" : "password"} placeholder="Confirm new password"
              className={`${inputCls("confirm")} pr-9`} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer" tabIndex={-1}>
              <span className="material-symbols-outlined text-lg">{showConfirm ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          {showError("confirm") && <p className="text-[11px] text-error mt-1">{errors.confirm}</p>}
        </div>

        {error && <AuthAlert message={error} type="error" />}

        <button type="submit" disabled={(submitted && hasErrors) || loading || !token}
          className="w-full bg-primary text-on-primary py-2 rounded-xl text-sm font-medium hover:brightness-110 active:brightness-95 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-on-surface-variant">
        <Link href="/login" className="text-primary font-medium hover:underline">Back to sign in</Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
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
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
