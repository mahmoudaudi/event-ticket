"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import EditProfileModal from "@/components/EditProfileModal";

interface DashboardData {
  user: { firstName: string; lastName: string; email: string; profileImage?: string };
  membership: { tier: string; points: number; nextTier: string | null; pointsToNext: number; totalEvents: number; totalSpent: number };
  bookings: any[];
  tickets: any[];
}

export default function DashboardPage() {
  const { user, token, loading: authLoading, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [bookingTab, setBookingTab] = useState<"active" | "past">("active");

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace("/login");
    }
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!user || !token) return;
    fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, token]);

  const fullName = data?.user?.firstName || user?.firstName || "";
  const lastName = data?.user?.lastName || user?.lastName || "";
  const email = data?.user?.email || user?.email || "";
  const avatarSrc = data?.user?.profileImage || user?.profileImage;
  const initial = fullName.charAt(0) || "U";

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!token) {
    return null;
  }

  if (loading) {
    return (
      <>
        <header className="bg-surface h-20 flex items-center px-4 md:px-10 shadow-[0px_4px_20px_rgba(30,41,59,0.05)]">
          <div className="max-w-[1280px] mx-auto w-full flex justify-between items-center">
            <div className="h-8 w-32 bg-surface-container-highest animate-pulse rounded" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-surface-container-highest animate-pulse rounded-full" />
              <div className="h-8 w-8 bg-surface-container-highest animate-pulse rounded-full" />
            </div>
          </div>
        </header>
        <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-6">
          <div className="h-12 w-72 bg-surface-container-highest animate-pulse rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-96 bg-surface-container-highest animate-pulse rounded-lg" />
            <div className="lg:col-span-4 h-96 bg-surface-container-highest animate-pulse rounded-lg" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="bg-surface sticky top-0 z-50 h-20 shadow-[0px_4px_20px_rgba(30,41,59,0.05)]">
        <div className="flex justify-between items-center w-full px-4 md:px-10 max-w-[1280px] mx-auto h-full">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold font-headline text-primary">Aurum</Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors duration-200">Browse Events</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center border-2 border-primary overflow-hidden">
              {avatarSrc ? (
                <img src={avatarSrc} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-primary">{initial}</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 min-h-screen">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-on-background">
            Welcome back, {fullName || "there"}.
          </h1>
          <p className="text-lg text-on-surface-variant mt-2">
            {data?.bookings && data.bookings.length > 0
              ? `You have ${data.bookings.length} upcoming event${data.bookings.length > 1 ? "s" : ""} this week.`
              : "Browse events to find your next experience."}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <section className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-headline text-on-surface">My Bookings</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setBookingTab("active")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-opacity ${
                    bookingTab === "active"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setBookingTab("past")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bookingTab === "past"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-variant"
                  }`}
                >
                  Past
                </button>
              </div>
            </div>

            {data?.bookings && data.bookings.length > 0 ? (
              <div className="space-y-4">
                {data.bookings
                  .filter((b: any) => bookingTab === "past" ? new Date(b.date) < new Date() : new Date(b.date) >= new Date())
                  .map((booking: any, i: number) => (
                    <div key={i} className="rounded-lg bg-surface-container-lowest overflow-hidden flex flex-col md:flex-row group shadow-[0px_4px_20px_rgba(30,41,59,0.05)] hover:shadow-[0px_10px_30px_rgba(30,41,59,0.08)] transition-shadow">
                      <div className="md:w-1/3 h-48 md:h-auto bg-surface-container-highest overflow-hidden">
                        {booking.bannerImage ? (
                          <img src={booking.bannerImage} alt={booking.eventName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                            <span className="material-symbols-outlined text-4xl">event</span>
                          </div>
                        )}
                      </div>
                      <div className="md:w-2/3 p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block uppercase tracking-wider">
                                {booking.status || "Confirmed"}
                              </span>
                              <h3 className="text-xl font-bold font-headline text-on-surface mb-1">{booking.eventName}</h3>
                            </div>
                            <button className="text-primary hover:bg-primary-fixed p-2 rounded-full transition-colors">
                              <span className="material-symbols-outlined">share</span>
                            </button>
                          </div>
                          <div className="flex items-center gap-4 mt-4 text-on-surface-variant">
                            {booking.date && (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                <span className="text-sm font-medium">{new Date(booking.date).toLocaleDateString()}</span>
                              </div>
                            )}
                            {booking.venue && (
                              <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                <span className="text-sm font-medium">{booking.venue}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-4 items-center justify-between border-t border-outline-variant pt-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white border border-outline-variant rounded-lg flex items-center justify-center">
                              <span className="material-symbols-outlined text-3xl text-on-background">qr_code_2</span>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                                {booking.ticketType || "General Admission"}
                              </p>
                              <p className="text-sm font-bold">
                                {booking.quantity || 1} ticket{booking.quantity > 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                          <button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="rounded-lg bg-surface-container-lowest p-12 text-center shadow-[0px_4px_20px_rgba(30,41,59,0.05)]">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">confirmation_number</span>
                <p className="text-lg text-on-surface-variant">No bookings yet.</p>
                <Link href="/" className="inline-block mt-4 bg-primary text-on-primary px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  Browse Events
                </Link>
              </div>
            )}
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <div className="rounded-lg p-6 shadow-[0px_4px_20px_rgba(30,41,59,0.05)] bg-surface-container-lowest">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-primary-fixed-dim overflow-hidden border-2 border-primary">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-primary">{initial}</div>
                    )}
                  </div>
                  <button
                    onClick={() => setEditOpen(true)}
                    className="absolute bottom-0 right-0 bg-white shadow-md rounded-full w-6 h-6 flex items-center justify-center text-primary border border-outline-variant"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
                <div>
                  <h3 className="text-lg font-bold font-headline text-on-surface">{fullName} {lastName}</h3>
                  <p className="text-sm text-on-surface-variant">{email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center justify-between w-full p-3 rounded-lg bg-primary-container text-on-primary-container font-bold"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">person</span>
                    <span className="text-sm font-medium">Personal Info</span>
                  </div>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
                <div className="flex items-center justify-between w-full p-3 rounded-lg text-on-surface-variant opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">payments</span>
                    <span className="text-sm font-medium">Payment Methods</span>
                  </div>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </div>
                <div className="flex items-center justify-between w-full p-3 rounded-lg text-on-surface-variant opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">security</span>
                    <span className="text-sm font-medium">Security</span>
                  </div>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </div>
                <Link href="/contact" className="flex items-center justify-between w-full p-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-all">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">mail</span>
                    <span className="text-sm font-medium">Contact Us</span>
                  </div>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </Link>
              </nav>
              <div className="mt-6 pt-4 border-t border-outline-variant">
                <button
                  onClick={() => { logout(); showToast("Logged out", "info"); }}
                  className="w-full text-error text-sm font-medium flex items-center justify-center gap-2 py-2 hover:bg-error-container/10 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined">logout</span>
                  Logout
                </button>
              </div>
            </div>

            <div className="bg-inverse-surface rounded-lg p-6 text-inverse-on-surface">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-secondary-fixed-dim mb-4">Membership Status</h4>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold">{data?.membership?.tier || "Bronze"} Tier</p>
                  <p className="text-sm opacity-80">{data?.membership?.totalEvents || 0} Events Attended</p>
                </div>
                <span className="material-symbols-outlined text-4xl text-primary-fixed-dim">verified</span>
              </div>
              {data?.membership?.nextTier && (
                <>
                  <div className="mt-4 w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min((data.membership.points / (data.membership.points + data.membership.pointsToNext)) * 100, 100)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-secondary-fixed-dim text-right">{data.membership.points} / {data.membership.points + data.membership.pointsToNext} pts to {data.membership.nextTier}</p>
                </>
              )}
            </div>
          </aside>
        </div>
      </main>

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={{ firstName: fullName, lastName, profileImage: avatarSrc }}
        onSave={async (profileData) => {
          try {
            const fd = new FormData();
            fd.append("firstName", profileData.firstName);
            fd.append("lastName", profileData.lastName);
            if (profileData.profileImage) {
              const blob = await fetch(profileData.profileImage).then((r) => r.blob());
              fd.append("profileImage", blob, "avatar.jpg");
            }
            const res = await fetch("/api/auth/update-profile", {
              method: "POST",
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              body: fd,
            });
            if (res.ok) {
              showToast("Profile updated!", "success");
              setEditOpen(false);
              const json = await res.json();
              setData((prev) => prev ? { ...prev, user: json.user } : prev);
              updateUser(json.user);
            } else {
              showToast("Failed to update profile", "error");
            }
          } catch {
            showToast("An error occurred", "error");
          }
        }}
      />

      <footer className="bg-surface-container-highest w-full py-16 px-4 md:px-10 mt-16">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4">
            <span className="text-2xl font-bold font-headline text-on-surface">Aurum</span>
            <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
              Your premium event ticket and reservation platform for exclusive experiences.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full md:w-auto">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-on-surface uppercase mb-2 tracking-wider">Explore</p>
              <Link href="/" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Events</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-on-surface uppercase mb-2 tracking-wider">Resources</p>
              <Link href="/contact" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Contact Us</Link>
              <Link href="/terms" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto mt-8 pt-4 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center text-on-surface-variant text-xs">
          <span>&copy; {new Date().getFullYear()} Aurum. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
