"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";

interface EventData {
  _id: string;
  title: string;
  description: string;
  img?: string;
  venue: string;
  city: string;
  eventDate: string;
  startTime: string;
  category: string;
  price: number;
}

const ITEMS_PER_PAGE = 9;

export default function EventsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const cat = p.get("category");
    if (cat) setCategory(cat);
  }, []);

  const [sort, setSort] = useState("date");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => { setEvents(d.events ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(events.map((e) => e.category))];

  const filtered = events
    .filter((e) => {
      if (category !== "All" && e.category !== category) return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.venue?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      return new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime();
    });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, Math.max(1, totalPages));
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <>
      <Navbar user={user} logout={logout} showToast={showToast} />
      <main className="pt-20 min-h-screen bg-background">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold font-headline text-on-surface">All Events</h1>
            <div className="flex flex-wrap gap-3">
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search events..."
                className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="date">Date</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm">
                  <div className="h-48 bg-surface-container-highest animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-3/4 bg-surface-container-highest animate-pulse rounded" />
                    <div className="h-4 w-1/2 bg-surface-container-highest animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : paginated.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((event) => (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="h-48 bg-surface-container-highest overflow-hidden">
                    {event.img ? (
                      <img src={event.img} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl">event</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-bold font-headline text-on-surface mb-1">{event.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-on-surface-variant mb-3">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : "TBD"}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {event.venue || event.city}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant">{event.category}</span>
                      <span className="text-primary font-bold">${event.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4">search_off</span>
              <p className="text-lg text-on-surface-variant">No events found.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-10">
              <button
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                className="px-4 py-2 rounded-lg border border-outline-variant text-sm disabled:opacity-30 hover:bg-surface-container transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    safePage === i + 1
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="px-4 py-2 rounded-lg border border-outline-variant text-sm disabled:opacity-30 hover:bg-surface-container transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-surface-container-highest border-t border-outline-variant/30 py-12 px-4 md:px-10">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <Link href="/" className="text-2xl font-bold font-headline text-on-surface">Aurum</Link>
            <p className="text-sm text-on-surface-variant max-w-xs mt-2">Connecting the world through curated, high-end experiences since 2024.</p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-8">
            <div className="flex flex-col gap-3">
              <h5 className="text-sm font-bold text-on-surface uppercase tracking-widest">Platform</h5>
              <Link href="/" className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors">Browse Events</Link>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="text-sm font-bold text-on-surface uppercase tracking-widest">Company</h5>
              <Link href="/contact" className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors">Contact</Link>
              <Link href="/terms" className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors">Terms</Link>
              <Link href="/privacy" className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
        <div className="max-w-[1280px] mx-auto mt-8 pt-4 border-t border-outline-variant text-center text-xs text-on-surface-variant">
          &copy; {new Date().getFullYear()} Aurum. All rights reserved.
        </div>
      </footer>
    </>
  );
}
