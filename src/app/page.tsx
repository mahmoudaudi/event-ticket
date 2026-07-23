"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const categories = ["All", "Tech", "Music", "Art", "Workshop"];
const ITEMS_PER_PAGE = 4;

interface EventData {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  price: number;
  img: string;
}

export default function Home() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState(2500);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const featuredRef = useRef<HTMLDivElement>(null);
  const discoverRef = useRef<HTMLHeadingElement>(null);
  const featuredSectionRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    if (!autoScroll || !featuredRef.current || featuredEvents.length === 0) return;
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

  const scrollFeatured = (dir: "left" | "right") => {
    if (!featuredRef.current) return;
    featuredRef.current.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };

  const handleFindTickets = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1500);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
        setTimeout(() => setSubscribed(false), 3000);
      }
    } catch {
      /* ignore */
    }
    setSubscribing(false);
  };

  const handleDetails = (title: string) => {
    alert(`Event: ${title}\n\nFull details coming soon!`);
  };

  const handleJoinNow = () => alert("Member Rewards — coming soon! Stay tuned.");
  const handleComingSoon = (name: string) => alert(`"${name}" — coming soon!`);
  const handleLogin = () => alert("Login page coming soon!");
  const handleSignUp = () => alert("Sign up page coming soon!");

  const featuredEvents = events.slice(0, 2);

  const filteredEvents = events
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-[0px_4px_20px_rgba(30,41,59,0.05)] h-20 flex items-center">
        <div className="flex justify-between items-center w-full px-[16px] md:px-[40px] max-w-[1280px] mx-auto h-20">
          <div className="flex items-center gap-[32px]">
            <a className="text-[24px] leading-[32px] font-semibold font-headline font-bold text-primary" href="#">EventPremium</a>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollTo(discoverRef)} className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-primary border-b-2 border-primary pb-1 transition-colors duration-200 cursor-pointer">Discover</button>
              <button onClick={() => scrollTo(featuredSectionRef)} className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer">Featured</button>
              <button onClick={() => scrollTo(eventsRef)} className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer">Events</button>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <span className="material-symbols-outlined text-outline text-[20px]">search</span>
              <input value={eventName} onChange={e => setEventName(e.target.value)} className="bg-transparent border-none focus:ring-0 text-[14px] leading-[20px] w-48 ml-2 placeholder:text-outline outline-none" placeholder="Search events..." type="text" />
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleLogin} className="hidden sm:flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-[14px] leading-[20px] tracking-[0.02em] font-medium group cursor-pointer">
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">login</span>
                Login
              </button>
              <button onClick={handleSignUp} className="hidden sm:flex bg-primary text-on-primary px-6 py-2.5 rounded-full text-[14px] leading-[20px] tracking-[0.02em] font-medium shadow-sm hover:shadow-md hover:brightness-110 active:brightness-95 transition-all cursor-pointer">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Announcement Ticker */}
        <div className="relative overflow-hidden bg-primary text-on-primary py-2.5">
          <div className="flex gap-8 animate-marquee whitespace-nowrap w-max" style={{ animation: "marquee 30s linear infinite" }}>
            <span className="inline-flex items-center gap-6 mx-4">
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60 animate-pulse-dot" />
              <span className="text-[13px] leading-[18px] font-medium tracking-wide">5 Events Selling Fast</span>
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60" />
              <span className="text-[13px] leading-[18px] font-medium tracking-wide">Next Event: Neon Horizon — Oct 14</span>
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60" />
              <span className="text-[13px] leading-[18px] font-medium tracking-wide">Early Bird: Future of Intelligence — $299</span>
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60" />
              <span className="text-[13px] leading-[18px] font-medium tracking-wide">Join 50K+ Tastemakers</span>
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60" />
              <span className="text-[13px] leading-[18px] font-medium tracking-wide">Berlin • London • SF • NY</span>
            </span>
            <span className="inline-flex items-center gap-6 mx-4" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60 animate-pulse-dot" />
              <span className="text-[13px] leading-[18px] font-medium tracking-wide">5 Events Selling Fast</span>
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60" />
              <span className="text-[13px] leading-[18px] font-medium tracking-wide">Next Event: Neon Horizon — Oct 14</span>
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60" />
              <span className="text-[13px] leading-[18px] font-medium tracking-wide">Early Bird: Future of Intelligence — $299</span>
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60" />
              <span className="text-[13px] leading-[18px] font-medium tracking-wide">Join 50K+ Tastemakers</span>
              <span className="w-1.5 h-1.5 rounded-full bg-on-primary/60" />
              <span className="text-[13px] leading-[18px] font-medium tracking-wide">Berlin • London • SF • NY</span>
            </span>
          </div>
        </div>

        {/* Hero */}
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden py-[80px] bg-gradient-to-b from-surface to-background">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />
          </div>
          <div className="relative z-10 w-full px-[16px] md:px-[40px] max-w-[1280px] mx-auto text-center scroll-reveal">
            <h1 ref={discoverRef} className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-display text-on-surface mb-[16px] max-w-3xl mx-auto">
              Extraordinary Moments, <span className="text-primary">Seamlessly</span> Reserved.
            </h1>
            <p className="text-[18px] leading-[28px] text-on-surface-variant mb-12 max-w-2xl mx-auto">
              Access the most exclusive corporate galas, tech summits, and cultural performances with the world&apos;s most refined event platform.
            </p>
            <div className="max-w-4xl mx-auto bg-surface-container-lowest rounded-2xl p-2 shadow-2xl flex flex-col md:flex-row items-stretch gap-2">
              <div className="flex-1 flex items-center px-4 py-3 gap-3 border-r border-outline-variant/30">
                <span className="material-symbols-outlined text-primary">event</span>
                <div className="text-left">
                  <label className="block text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline uppercase">Event Name</label>
                  <input value={eventName} onChange={e => setEventName(e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 text-[16px] leading-[24px] font-medium placeholder:text-surface-dim outline-none" placeholder="Design Week 2024" type="text" />
                </div>
              </div>
              <div className="flex-1 flex items-center px-4 py-3 gap-3 border-r border-outline-variant/30">
                <span className="material-symbols-outlined text-primary">category</span>
                <div className="text-left">
                  <label className="block text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline uppercase">Category</label>
                  <select className="w-full bg-transparent border-none p-0 focus:ring-0 text-[16px] leading-[24px] font-medium outline-none appearance-none">
                    <option>All Categories</option>
                    <option>Tech Summit</option>
                    <option>Gala Dinner</option>
                    <option>Live Performance</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 flex items-center px-4 py-3 gap-3">
                <span className="material-symbols-outlined text-primary">location_on</span>
                <div className="text-left">
                  <label className="block text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline uppercase">Location</label>
                  <input value={location} onChange={e => setLocation(e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 text-[16px] leading-[24px] font-medium placeholder:text-surface-dim outline-none" placeholder="San Francisco, CA" type="text" />
                </div>
              </div>
              <button onClick={handleFindTickets} className="bg-primary text-on-primary px-10 rounded-xl text-[14px] leading-[20px] tracking-[0.02em] font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all py-4 cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">search</span>
                {isSearching ? "Searching..." : "Find Tickets"}
              </button>
            </div>
          </div>
        </section>

        {/* Featured */}
        <section
          ref={featuredSectionRef}
          className="py-[80px] bg-surface-container-low overflow-hidden"
          onMouseEnter={() => setAutoScroll(false)}
          onMouseLeave={() => setAutoScroll(true)}
        >
          <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto mb-[32px] flex justify-between items-end scroll-reveal">
            <div>
              <span className="text-primary text-[14px] leading-[20px] tracking-[0.02em] font-medium tracking-[0.2em] uppercase mb-2 block">Curation</span>
              <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold font-headline text-on-surface">Featured Experiences</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => scrollFeatured("left")} className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface transition-colors cursor-pointer">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button onClick={() => scrollFeatured("right")} className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface transition-colors cursor-pointer">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          {loading ? (
            <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto">
              <div className="min-w-[400px] md:min-w-[600px] aspect-[16/9] rounded-2xl animate-shimmer" />
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto text-center py-12 text-on-surface-variant">
              No featured events yet. Check back soon!
            </div>
          ) : (
          <div ref={featuredRef} className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto overflow-x-auto hide-scrollbar flex gap-[24px] scroll-reveal scroll-reveal-delay-1">
            {featuredEvents.map((ev) => (
              <div key={ev._id} className="min-w-[400px] md:min-w-[600px] group cursor-pointer" onClick={() => handleDetails(ev.title)}>
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4">
                  {ev.img ? (
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={ev.title} src={ev.img} />
                  ) : (
                    <div className="w-full h-full bg-surface-container flex items-center justify-center text-outline">No Image</div>
                  )}
                  <div className="absolute top-4 left-4 bg-primary text-on-primary text-[12px] leading-[16px] tracking-[0.05em] font-semibold px-4 py-1.5 rounded-full shadow-lg">Featured</div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-white">
                    <p className="text-[14px] leading-[20px] tracking-[0.02em] font-medium opacity-80 mb-1">{ev.category}</p>
                    <h3 className="text-[24px] leading-[32px] font-semibold font-headline">{ev.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </section>

        {/* Events Grid & Filters */}
        <section ref={eventsRef} className="py-[80px] px-[16px] md:px-[40px] max-w-[1280px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-[32px]">
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h4 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface mb-4 uppercase tracking-widest">Filters</h4>
                  <div className="space-y-6">
                    <div>
                      <p className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline mb-3">Price Bracket</p>
                      <input value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} className="w-full h-1.5 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary" type="range" min="0" max="2500" />
                      <div className="flex justify-between mt-2 text-[12px] leading-[16px] text-on-surface-variant">
                        <span>$0</span>
                        <span>${priceRange > 2000 ? "2500+" : priceRange}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline mb-3">Experience Type</p>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                            className={`px-3 py-1 rounded-full text-[12px] leading-[16px] tracking-[0.05em] font-semibold transition-colors cursor-pointer ${
                              activeCategory === cat
                                ? "bg-primary-container text-on-primary-container"
                                : "bg-surface-container text-on-surface-variant hover:bg-outline-variant"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-primary rounded-2xl text-on-primary relative overflow-hidden group">
                  <div className="relative z-10">
                    <h5 className="text-[24px] leading-[32px] font-semibold font-headline mb-2">Member Rewards</h5>
                    <p className="text-[14px] leading-[20px] opacity-90 mb-4">Join our Inner Circle for early access to global premieres.</p>
                    <button onClick={handleJoinNow} className="w-full bg-white text-primary py-2 rounded-lg text-[14px] leading-[20px] tracking-[0.02em] font-medium cursor-pointer">Join Now</button>
                  </div>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-8 scroll-reveal">
                <h3 className="text-[24px] leading-[32px] font-semibold font-headline">
                  {loading ? "Loading..." : `${filteredEvents.length} Event${filteredEvents.length !== 1 ? "s" : ""} Found`}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-outline uppercase">Sort By:</span>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none text-[14px] leading-[20px] tracking-[0.02em] font-medium text-primary focus:ring-0 outline-none">
                    <option>Recommended</option>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-surface-container-lowest rounded-2xl overflow-hidden">
                      <div className="h-48 animate-shimmer" />
                      <div className="p-6 space-y-3">
                        <div className="h-4 animate-shimmer rounded w-1/3" />
                        <div className="h-6 animate-shimmer rounded w-3/4" />
                        <div className="h-4 animate-shimmer rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20 scroll-reveal">
                  <span className="material-symbols-outlined text-[48px] text-outline mb-4">search_off</span>
                  <p className="text-[18px] leading-[28px] text-on-surface-variant">No events match your filters. Try adjusting them!</p>
                </div>
              ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] scroll-reveal">
                  {paginatedEvents.map((ev) => (
                    <article key={ev._id} className="bg-surface-container-lowest rounded-2xl overflow-hidden premium-card-shadow flex flex-col">
                      <div className="relative h-48">
                        {ev.img ? (
                          <img className="w-full h-full object-cover" alt={ev.title} src={ev.img} />
                        ) : (
                          <div className="w-full h-full bg-surface-container flex items-center justify-center text-outline text-[14px]">No Image</div>
                        )}
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-primary font-bold text-[14px] leading-[20px] shadow-sm">${ev.price}</div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                          <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">{ev.date}</span>
                        </div>
                        <h4 className="text-[24px] leading-[32px] font-semibold font-headline mb-2 text-on-surface">{ev.title}</h4>
                        <p className="text-[14px] leading-[20px] text-on-surface-variant line-clamp-2 mb-6">{ev.description}</p>
                        <div className="mt-auto flex justify-between items-center pt-4 border-t border-outline-variant/30">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-outline text-[18px]">location_on</span>
                            <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">{ev.location}</span>
                          </div>
                          <button onClick={() => handleDetails(ev.title)} className="text-primary text-[14px] leading-[20px] tracking-[0.02em] font-medium flex items-center gap-1 group cursor-pointer">
                            Details
                            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-4">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-30 hover:bg-surface-container transition-colors disabled:cursor-not-allowed cursor-pointer">
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-10 h-10 rounded-lg text-[14px] leading-[20px] tracking-[0.02em] font-medium transition-colors cursor-pointer ${safePage === i + 1 ? "bg-primary text-on-primary" : "hover:bg-surface-container"}`}>
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                    Next
                  </button>
                </div>
                )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-[80px] px-[16px] md:px-[40px]">
          <div className="max-w-[1280px] mx-auto bg-inverse-surface rounded-3xl p-[32px] md:p-20 relative overflow-hidden text-center">
            <div className="relative z-10 max-w-2xl mx-auto scroll-reveal">
              <h2 className="text-[48px] leading-[56px] font-bold tracking-[-0.02em] font-display text-white mb-6">Stay Ahead of the Scene</h2>
              <p className="text-[18px] leading-[28px] text-white/70 mb-10">Join 50,000+ tastemakers receiving exclusive early invitations and curated city guides every Tuesday.</p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input value={email} onChange={e => setEmail(e.target.value)} className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder="Enter your email" type="email" required />
                <button type="submit" disabled={subscribing} className="bg-primary text-on-primary px-10 py-4 rounded-xl text-[14px] leading-[20px] tracking-[0.02em] font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
                  {subscribing ? "Subscribing..." : subscribed ? "Subscribed ✓" : "Subscribe Now"}
                </button>
              </form>
              {subscribed && <p className="mt-4 text-[14px] leading-[20px] text-green-300">You&apos;re in! Welcome to the Inner Circle.</p>}
              {!subscribed && <p className="mt-4 text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-white/40">Premium privacy. No spam, ever.</p>}
            </div>
          </div>
        </section>
      </main>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center transition-all duration-300 cursor-pointer hover:shadow-xl hover:brightness-110 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <span className="material-symbols-outlined">arrow_upward</span>
      </button>

      {/* Footer */}
      <footer className="bg-surface-container-highest border-t border-outline-variant/30">
        <div className="w-full py-[80px] px-[16px] md:px-[40px] flex flex-col md:flex-row justify-between items-start md:items-center max-w-[1280px] mx-auto gap-8">
          <div className="flex flex-col gap-4">
            <a className="text-[24px] leading-[32px] font-semibold font-headline font-bold text-on-surface" href="#">EventPremium</a>
            <p className="text-[14px] leading-[20px] text-on-surface-variant max-w-xs">Connecting the world through curated, high-end experiences since 2024.</p>
            <div className="flex gap-4">
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-[20px]">public</span></a>
              <a className="text-on-surface-variant hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-[20px]">share</span></a>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-8">
            <div className="flex flex-col gap-3">
              <h5 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface font-bold uppercase tracking-widest">Platform</h5>
              <button onClick={() => scrollTo(eventsRef)} className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left cursor-pointer">Browse Events</button>
              <button onClick={() => handleComingSoon("Venues")} className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left cursor-pointer">Venues</button>
              <button onClick={() => handleComingSoon("Pricing")} className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left cursor-pointer">Pricing</button>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface font-bold uppercase tracking-widest">Company</h5>
              <button onClick={() => handleComingSoon("About Us")} className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left cursor-pointer">About Us</button>
              <button onClick={() => handleComingSoon("Careers")} className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left cursor-pointer">Careers</button>
              <button onClick={() => handleComingSoon("Contact Us")} className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left cursor-pointer">Contact Us</button>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface font-bold uppercase tracking-widest">Legal</h5>
              <button onClick={() => handleComingSoon("Terms of Service")} className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left cursor-pointer">Terms of Service</button>
              <button onClick={() => handleComingSoon("Privacy Policy")} className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left cursor-pointer">Privacy Policy</button>
              <button onClick={() => handleComingSoon("Cookie Policy")} className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left cursor-pointer">Cookie Policy</button>
            </div>
          </div>
        </div>
        <div className="px-[16px] md:px-[40px] py-8 border-t border-outline-variant/20 max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-[14px] leading-[20px] text-on-surface-variant opacity-80">&copy; 2026 EventPremium. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
