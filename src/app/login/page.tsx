"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthAlert, useToast } from "@/components/Toast";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = Record<string, string>;

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}

function LoginContent() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const messages: Record<string, string> = {
        google_auth_failed: "Google auth failed. No code received.",
        google_token_failed: "Failed to get token from Google.",
        google_profile_failed: "Failed to fetch your Google profile.",
        google_error: "Something went wrong with Google sign in.",
      };
      setServerError(messages[error] || "Google sign in failed.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  const validate = useCallback((name: string, value: string): string => {
    switch (name) {
      case "email": return EMAIL_RE.test(value) ? "" : "Enter a valid email address";
      case "password": return value ? "" : "Password is required";
      default: return "";
    }
  }, []);

  const errors: Errors = { email: validate("email", email), password: validate("password", password) };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleBlur = (name: string) => setTouched((prev) => new Set(prev).add(name));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const allTouched = new Set(touched);
    ["email", "password"].forEach((n) => allTouched.add(n));
    setTouched(allTouched);
    if (hasErrors) return;
    setLoading(true);
    setServerError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return setServerError(data.error);
      login(data.token, data.user);
      showToast("Welcome back!", "success");
      router.push("/");
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const showError = (name: string) => (touched.has(name) || submitted) && errors[name];

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
            backgroundImage: `radial-gradient(circle at 25% 50%, var(--color-primary) 0%, transparent 50%),
                              radial-gradient(circle at 75% 30%, var(--color-primary-container) 0%, transparent 50%),
                              radial-gradient(circle at 50% 80%, var(--color-secondary-fixed) 0%, transparent 50%)`,
          }} />
        <div className="relative text-center max-w-md">
          <div className="text-6xl mb-6 font-display font-extrabold tracking-tight text-primary">
            Aurum
          </div>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Access the most exclusive corporate galas, tech summits, and cultural performances.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-4">
            <Link href="/" className="text-2xl font-display font-extrabold tracking-tight text-primary">
              Aurum
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50">
            <h1 className="text-xl font-semibold font-headline text-on-surface text-center mb-1">
              Welcome back
            </h1>
            <p className="text-sm text-on-surface-variant text-center mb-5">
              Sign in to your account
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-on-surface mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => handleBlur("email")}
                  type="email" placeholder="m@example.com" className={inputCls("email")} />
                {showError("email") && <p className="text-[11px] text-error mt-1">{errors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-on-surface">Password</label>
                  <Link href="/forgot-password" className="text-[11px] text-primary font-medium hover:underline cursor-pointer transition-all">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => handleBlur("password")}
                    type={showPassword ? "text" : "password"} placeholder="Enter your password"
                    className={`${inputCls("password")} pr-9`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer" tabIndex={-1}>
                    <span className="material-symbols-outlined text-lg">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                {showError("password") && <p className="text-[11px] text-error mt-1">{errors.password}</p>}
              </div>

              {serverError && <AuthAlert message={serverError} type="error" />}

              <button type="submit" disabled={(submitted && hasErrors) || loading}
                className="w-full bg-primary text-on-primary py-2 rounded-xl text-sm font-medium hover:brightness-110 active:brightness-95 transition-all cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? "Signing in..." : "Sign In"}
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
              Continue with Google
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
