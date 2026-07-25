"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import Navbar from "@/components/Navbar";
import EditProfileModal from "@/components/EditProfileModal";

interface DashboardData {
  user: { firstName: string; lastName: string; email: string; profileImage?: string };
  bookings: any[];
  tickets: any[];
}

export default function DashboardPage() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("token");
    const u = p.get("user");
    if (t && u) {
      try { login(t, JSON.parse(u)); } catch {}
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/dashboard", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (authLoading) {
    return (
      <>
        <Navbar user={null} logout={() => {}} showToast={showToast} />
        <main className="pt-20 min-h-screen flex items-center justify-center bg-background">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </main>
      </>
    );
  }

  if (!token) {
    return (
      <>
        <Navbar user={null} logout={() => {}} showToast={showToast} />
        <main className="pt-20 min-h-screen flex items-center justify-center bg-background">
          <p className="text-on-surface-variant">Please <a href="/login" className="text-primary underline">sign in</a> to view your dashboard.</p>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar user={user} logout={logout} showToast={showToast} />
        <main className="pt-20 min-h-screen bg-background p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-32 animate-shimmer rounded-2xl" />
            <div className="h-64 animate-shimmer rounded-2xl" />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} logout={logout} showToast={showToast} />
      <main className="pt-20 min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center text-2xl font-bold text-primary">
                {data?.user?.firstName?.charAt(0) || user?.firstName?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold font-headline text-on-surface">
                  {data?.user?.firstName || user?.firstName} {data?.user?.lastName || user?.lastName}
                </h1>
                <p className="text-on-surface-variant">{data?.user?.email || user?.email}</p>
              </div>
              <button onClick={() => setEditOpen(true)} className="px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-medium hover:brightness-110 transition-all">
                Edit Profile
              </button>
            </div>
          </div>

          <EditProfileModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            user={{ firstName: data?.user?.firstName || user?.firstName || "", lastName: data?.user?.lastName || user?.lastName || "", profileImage: data?.user?.profileImage || user?.profileImage }}
            onSave={async (profileData) => {
              try {
                const res = await fetch("/api/auth/update-profile", {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                  body: JSON.stringify(profileData),
                });
                if (res.ok) {
                  showToast("Profile updated!", "success");
                  setEditOpen(false);
                  const json = await res.json();
                  setData((prev) => prev ? { ...prev, user: json.user } : prev);
                } else {
                  showToast("Failed to update profile", "error");
                }
              } catch {
                showToast("An error occurred", "error");
              }
            }}
          />

          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-6">Your Tickets</h2>
            {data?.tickets && data.tickets.length > 0 ? (
              <div className="space-y-4">
                {data.tickets.map((ticket: any, i: number) => (
                  <div key={i} className="p-4 bg-surface-container rounded-xl flex justify-between items-center">
                    <div>
                      <p className="font-medium text-on-surface">{ticket.eventName || ticket.event?.title}</p>
                      <p className="text-sm text-on-surface-variant">{ticket.date ? new Date(ticket.date).toLocaleDateString() : ""}</p>
                    </div>
                    <span className="text-primary font-semibold">${ticket.price || ticket.amount}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant">No tickets yet.</p>
            )}
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-bold font-headline text-on-surface mb-6">Booking History</h2>
            {data?.bookings && data.bookings.length > 0 ? (
              <div className="space-y-4">
                {data.bookings.map((booking: any, i: number) => (
                  <div key={i} className="p-4 bg-surface-container rounded-xl">
                    <p className="font-medium text-on-surface">{booking.eventName || booking.event?.title}</p>
                    <p className="text-sm text-on-surface-variant">
                      {booking.date ? new Date(booking.date).toLocaleDateString() : ""} — {booking.status || "Confirmed"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant">No bookings yet.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
