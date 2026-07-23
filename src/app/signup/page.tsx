"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Record<string, string>;

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const validate = useCallback((name: string, value: string): string => {
    switch (name) {
      case "firstName": return value.trim() ? "" : "First name is required";
      case "lastName": return value.trim() ? "" : "Last name is required";
      case "email": return EMAIL_RE.test(value) ? "" : "Enter a valid email address";
      case "password": {
        if (value.length < 8) return "At least 8 characters required";
        if (!/[A-Z]/.test(value)) return "Must include 1 uppercase letter";
        if (!/[^a-zA-Z0-9]/.test(value)) return "Must include 1 symbol";
        return "";
      }
      default: return "";
    }
  }, []);

  const errors: Errors = { firstName: validate("firstName", firstName), lastName: validate("lastName", lastName), email: validate("email", email), password: validate("password", password) };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleBlur = (name: string) => {
    setTouched((prev) => new Set(prev).add(name));
  };

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const allTouched = new Set(touched);
    ["firstName", "lastName", "email", "password"].forEach((n) => allTouched.add(n));
    setTouched(allTouched);
    if (hasErrors || !agreed) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setServerError(data.error);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/";
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showError = (name: string) => (touched.has(name) || submitted) && errors[name];

  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const passedChecks = (password.length >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasSymbol ? 1 : 0);
  const strength = password.length === 0 ? 0 : passedChecks;

  const inputCls = (name: string) =>
    `w-full px-3.5 py-2 rounded-xl border text-sm text-on-surface placeholder:text-outline/60 outline-none transition-all duration-200 bg-white/60 focus:ring-2 ${
      showError(name)
        ? "border-error focus:border-error focus:ring-error/10"
        : "border-outline-variant focus:border-primary focus:ring-primary/10"
    }`;

  return (
    <div className="h-screen overflow-hidden bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary-container/20 to-background items-center justify-center p-12">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 60%, var(--color-primary) 0%, transparent 50%),
                              radial-gradient(circle at 70% 20%, var(--color-primary-container) 0%, transparent 50%),
                              radial-gradient(circle at 40% 90%, var(--color-secondary-fixed) 0%, transparent 50%)`,
          }} />
        <div className="relative text-center max-w-md">
          <div className="text-6xl mb-6 font-display font-extrabold tracking-tight text-primary">
            Event<span className="text-primary-container">Premium</span>
          </div>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Join today and be the first to access extraordinary events curated just for you.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-4">
            <Link href="/" className="text-2xl font-display font-extrabold tracking-tight text-primary">
              Event<span className="text-primary-container">Premium</span>
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50">
            <h1 className="text-xl font-semibold font-headline text-on-surface text-center mb-1">
              Create account
            </h1>
            <p className="text-sm text-on-surface-variant text-center mb-5">
              Create your premium account
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-on-surface mb-1">First</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} onBlur={() => handleBlur("firstName")}
                    placeholder="John" className={inputCls("firstName")} />
                  {showError("firstName") && <p className="text-[11px] text-error mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-on-surface mb-1">Last</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} onBlur={() => handleBlur("lastName")}
                    placeholder="Doe" className={inputCls("lastName")} />
                  {showError("lastName") && <p className="text-[11px] text-error mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => handleBlur("email")}
                  type="email" placeholder="m@example.com" className={inputCls("email")} />
                {showError("email") && <p className="text-[11px] text-error mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Password</label>
                <div className="relative">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => handleBlur("password")}
                    type={showPassword ? "text" : "password"} placeholder="Create a password"
                    className={`${inputCls("password")} pr-9`} />
                  {showError("password") && <p className="text-[11px] text-error mt-1">{errors.password}</p>}
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer" tabIndex={-1}>
                    <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((l) => (
                        <div key={l} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                          strength === 3 ? "bg-green-600" : strength >= l ? (l <= 1 ? "bg-error" : l === 2 ? "bg-orange-500" : "bg-green-600") : "bg-surface-container"
                        }`} />
                      ))}
                    </div>
                    <p className="text-[11px] text-outline">
                      {strength === 3 ? "Strong password" : ""}
                    </p>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20 cursor-pointer shrink-0" />
                <span className="text-xs text-on-surface-variant leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary font-medium hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-primary font-medium hover:underline">Privacy Policy</Link>
                </span>
              </label>

              {serverError && <p className="text-[11px] text-error text-center">{serverError}</p>}

              <button type="submit" disabled={!agreed || (submitted && hasErrors) || loading}
                className="w-full bg-primary text-on-primary py-2 rounded-xl text-sm font-medium hover:brightness-110 active:brightness-95 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/30" /></div>
              <div className="relative flex justify-center">
                <span className="bg-white/80 backdrop-blur-xl px-3 text-xs text-outline">or</span>
              </div>
            </div>

            <button type="button" onClick={() => window.location.href = "/api/auth/google"}
              className="w-full flex items-center justify-center gap-2.5 px-3.5 py-2 rounded-xl border border-outline-variant bg-white/50 text-xs font-medium text-on-surface hover:bg-surface-container transition-all cursor-pointer backdrop-blur-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign up with Google
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>


        </div>
      </div>
    </div>
  );
}
