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
import EventsGrid from "@/components/EventsGrid";
import EventsMap from "@/components/EventsMap";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import MarqueeBar from "@/components/MarqueeBar";

const categories = ["All", "Tech", "Music", "Art", "Workshop"];
const ITEMS_PER_PAGE = 4;

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

  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState(2500);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredEvents = allEvents
    .filter((ev) => {
      const matchName = !eventName || ev.title.toLowerCase().includes(eventName.toLowerCase());
      const matchLocation = !location || ev.location.toLowerCase().includes(location.toLowerCase());
      const matchPrice = ev.price <= priceRange;
      const matchCategory = activeCategory === "All" || ev.category === activeCategory;
      return matchName && matchLocation && matchPrice && matchCategory;
    })
    .sort((a, b) => (sortBy === "Price: Low to High" ? a.price - b.price : 0));

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedEvents = filteredEvents.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <>
      <Navbar
        eventName={eventName} setEventName={setEventName}
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
          eventName={eventName} setEventName={setEventName}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          location={location} setLocation={setLocation}
          handleFindTickets={handleFindTickets} isSearching={isSearching}
          categories={categories} setCurrentPage={setCurrentPage}
        />

        <FeaturedCarousel
          events={allEvents} loading={loading}
          featuredSectionRef={featuredSectionRef} featuredRef={featuredRef}
          autoScroll={autoScroll} setAutoScroll={setAutoScroll}
        />

        <CategoryCards
          setActiveCategory={setActiveCategory} setCurrentPage={setCurrentPage}
          scrollTo={scrollTo} eventsRef={eventsRef} categoriesRef={categoriesRef}
        />

        <UpcomingEvents events={upcomingEvents} loading={upcomingLoading} upcomingRef={upcomingRef} />
        <PopularEvents events={popularEvents} loading={popularLoading} popularRef={popularRef} />

        <EventsGrid
          filteredEvents={filteredEvents} paginatedEvents={paginatedEvents}
          loading={loading}
          priceRange={priceRange} setPriceRange={setPriceRange}
          activeCategory={activeCategory} setActiveCategory={setActiveCategory}
          setCurrentPage={setCurrentPage} categories={categories}
          sortBy={sortBy} setSortBy={setSortBy}
          safePage={safePage} totalPages={totalPages} currentPage={currentPage}
          eventsRef={eventsRef}
        />

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
