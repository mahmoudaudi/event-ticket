"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import CategoryCards from "@/components/CategoryCards";
import UpcomingEvents from "@/components/UpcomingEvents";
import PopularEvents from "@/components/PopularEvents";
import EventsMap from "@/components/EventsMap";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import MarqueeBar from "@/components/MarqueeBar";

interface EventData {
  _id: string; title: string; description: string; category: string;
  date: string; location: string; price: number; img: string;
}

export default function Home() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const { showToast } = useToast();
  const [allEvents, setAllEvents] = useState<EventData[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<EventData[]>([]);
  const [popularEvents, setPopularEvents] = useState<EventData[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  const [isSearching, setIsSearching] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const featuredRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLHeadingElement>(null);
  const featuredSectionRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const upcomingRef = useRef<HTMLDivElement>(null);
  const popularRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => { setAllEvents(d.events ?? []); setLoading(false); })
      .catch(() => setLoading(false));

    fetch("/api/events?featured=true")
      .then((r) => r.json())
      .then((d) => setFeaturedEvents(d.events ?? []))
      .catch(() => {})
      .finally(() => setFeaturedLoading(false));

    fetch("/api/events?popular=true")
      .then((r) => r.json())
      .then((d) => setPopularEvents(d.events ?? []))
      .catch(() => {})
      .finally(() => setPopularLoading(false));

    fetch("/api/events?upcoming=true")
      .then((r) => r.json())
      .then((d) => setUpcomingEvents(d.events ?? []))
      .catch(() => {})
      .finally(() => setUpcomingLoading(false));
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("token");
    const u = p.get("user");
    if (t && u) { try { login(t, JSON.parse(u)); window.history.replaceState({}, "", window.location.pathname); } catch {} }
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add("revealed"); observer.unobserve(entry.target); }
        });
      }, { threshold: 0.1 }
    );
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    const fe = allEvents.slice(0, 2);
    if (!autoScroll || !featuredRef.current || fe.length === 0) return;
    const interval = setInterval(() => {
      if (!featuredRef.current) return;
      const maxScroll = featuredRef.current.scrollWidth - featuredRef.current.clientWidth;
      if (featuredRef.current.scrollLeft >= maxScroll - 10) {
        featuredRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        featuredRef.current.scrollBy({ left: 600, behavior: "smooth" });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [autoScroll, loading]);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | HTMLHeadingElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFindTickets = () => {
    setIsSearching(true);
    setTimeout(() => { setIsSearching(false); eventsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 800);
  };

  return (
    <>
      <Navbar
        user={user} logout={logout} showToast={showToast}
        scrollTo={scrollTo}
        discoverRef={discoverRef} featuredSectionRef={featuredSectionRef}
        categoriesRef={categoriesRef} upcomingRef={upcomingRef}
        popularRef={popularRef} eventsRef={eventsRef}
      />

      <MarqueeBar />

      <main className="pt-[120px]">
        <Hero
          discoverRef={discoverRef}
          handleFindTickets={handleFindTickets} isSearching={isSearching}
        />

        <FeaturedCarousel
          events={allEvents} loading={loading}
          featuredSectionRef={featuredSectionRef} featuredRef={featuredRef}
          autoScroll={autoScroll} setAutoScroll={setAutoScroll}
        />

        <CategoryCards
          scrollTo={scrollTo} eventsRef={eventsRef} categoriesRef={categoriesRef}
        />

        <UpcomingEvents events={upcomingEvents} loading={upcomingLoading} upcomingRef={upcomingRef} />
        <PopularEvents events={popularEvents} loading={popularLoading} popularRef={popularRef} />

        <section ref={eventsRef} id="events" className="py-[80px] px-[16px] md:px-[40px] max-w-[1280px] mx-auto">
          <div className="flex justify-between items-center mb-8 scroll-reveal">
            <h3 className="text-[24px] leading-[32px] font-semibold font-headline text-on-surface">All Events</h3>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm">
                  <div className="h-48 bg-surface-container-highest animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 bg-surface-container-highest animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-surface-container-highest animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {allEvents.slice(0, 8).map((ev, i) => (
                <Link key={ev._id} href={`/events/${ev._id}`} className={`rounded-2xl bg-surface-container-lowest overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 group scroll-reveal ${i >= 4 ? "reveal-delay-1" : ""}`}>
                  <div className="h-48 overflow-hidden">
                    {ev.img ? <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={ev.img} alt={ev.title} /> : <div className="w-full h-full bg-gradient-to-br from-primary-container to-tertiary-container flex items-center justify-center"><span className="material-symbols-outlined text-4xl text-on-primary-container">event</span></div>}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold px-2 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant">{ev.category || "General"}</span>
                      {ev.price > 0 && <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold px-2 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant">${ev.price}</span>}
                    </div>
                    <h4 className="text-[16px] leading-[24px] font-medium text-on-surface mb-1 line-clamp-1">{ev.title}</h4>
                    <p className="text-[14px] leading-[20px] text-on-surface-variant line-clamp-1">{ev.description}</p>
                    <div className="flex items-center gap-3 mt-3 text-[12px] leading-[16px] text-on-surface-variant">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{ev.date ? new Date(ev.date).toLocaleDateString() : "TBD"}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{ev.location || "Online"}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="flex justify-center pb-[48px] md:pb-[80px]">
          <Link href="/events" className="bg-primary text-on-primary px-8 py-3 rounded-full text-[14px] leading-[20px] tracking-[0.02em] font-medium shadow-sm hover:shadow-md hover:brightness-110 active:brightness-95 transition-all flex items-center gap-2">
            View All Events
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        <EventsMap />
      </main>

      <BackToTop show={showBackToTop} />
      <Footer scrollTo={scrollTo} eventsRef={eventsRef} />
    </>
  );
}
