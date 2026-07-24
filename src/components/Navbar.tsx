"use client";
import { useState } from "react";
import Link from "next/link";

type ToastType = "success" | "error" | "info";

interface NavbarProps {
  eventName: string;
  setEventName: (v: string) => void;
  user: any;
  logout: () => void;
  showToast: (message: string, type?: ToastType) => void;
  scrollTo: (ref: React.RefObject<HTMLDivElement | HTMLHeadingElement | null>) => void;
  discoverRef: React.RefObject<HTMLHeadingElement | null>;
  featuredSectionRef: React.RefObject<HTMLDivElement | null>;
  categoriesRef: React.RefObject<HTMLDivElement | null>;
  upcomingRef: React.RefObject<HTMLDivElement | null>;
  popularRef: React.RefObject<HTMLDivElement | null>;
  eventsRef: React.RefObject<HTMLDivElement | null>;
}

export default function Navbar({
  eventName, setEventName, user, logout, showToast,
  scrollTo, discoverRef, featuredSectionRef, categoriesRef,
  upcomingRef, popularRef, eventsRef,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-[0px_4px_20px_rgba(30,41,59,0.05)] h-20 flex items-center">
        <div className="flex justify-between items-center w-full px-[16px] md:px-[40px] max-w-[1280px] mx-auto h-20">
          <div className="flex items-center gap-[32px]">
            <Link href="/" className="text-[24px] leading-[32px] font-semibold font-headline font-bold text-primary">Aurum</Link>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollTo(discoverRef)} className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-primary border-b-2 border-primary pb-1 transition-colors duration-200 cursor-pointer">Discover</button>
              <button onClick={() => scrollTo(featuredSectionRef)} className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer">Featured</button>
              <button onClick={() => scrollTo(categoriesRef)} className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer">Categories</button>
              <button onClick={() => scrollTo(upcomingRef)} className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer">Upcoming</button>
              <button onClick={() => scrollTo(popularRef)} className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer">Popular</button>
              <button onClick={() => scrollTo(eventsRef)} className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer">Events</button>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center bg-surface-container rounded-full px-4 py-2 border border-outline-variant focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <span className="material-symbols-outlined text-outline text-[20px]">search</span>
              <input value={eventName} onChange={e => setEventName(e.target.value)} className="bg-transparent border-none focus:ring-0 text-[14px] leading-[20px] w-48 ml-2 placeholder:text-outline outline-none" placeholder="Search events..." type="text" />
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden sm:block text-[14px] leading-[20px] font-medium text-on-surface">
                    {user.firstName} {user.lastName}
                  </span>
                  <button onClick={() => { logout(); showToast("Logged out successfully", "info"); }} className="text-sm text-on-surface-variant hover:text-error transition-colors cursor-pointer" title="Logout">
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-[14px] leading-[20px] tracking-[0.02em] font-medium group">
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">login</span>
                    Login
                  </Link>
                  <Link href="/signup" className="hidden sm:flex bg-primary text-on-primary px-6 py-2.5 rounded-full text-[14px] leading-[20px] tracking-[0.02em] font-medium shadow-sm hover:shadow-md hover:brightness-110 active:brightness-95 transition-all">
                    Sign Up
                  </Link>
                </>
              )}
              <button onClick={() => setMobileOpen(true)} className="sm:hidden flex items-center justify-center w-10 h-10 text-on-surface hover:text-primary transition-colors cursor-pointer" aria-label="Open menu">
                <span className="material-symbols-outlined text-[24px]">menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[100] sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-80 bg-surface shadow-2xl p-6 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-display font-extrabold tracking-tight text-primary">Aurum</span>
              <button onClick={() => setMobileOpen(false)} className="text-on-surface hover:text-primary transition-colors cursor-pointer p-1" aria-label="Close menu">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="flex items-center bg-surface-container rounded-full px-4 py-2.5 border border-outline-variant mb-6">
              <span className="material-symbols-outlined text-outline text-[20px]">search</span>
              <input value={eventName} onChange={e => setEventName(e.target.value)} className="bg-transparent border-none focus:ring-0 text-[14px] leading-[20px] w-full ml-2 placeholder:text-outline outline-none" placeholder="Search events..." type="text" />
            </div>
            <nav className="flex flex-col gap-1">
              {[
                { label: "Discover", icon: "explore", ref: discoverRef },
                { label: "Featured", icon: "star", ref: featuredSectionRef },
                { label: "Categories", icon: "category", ref: categoriesRef },
                { label: "Upcoming", icon: "upcoming", ref: upcomingRef },
                { label: "Popular", icon: "trending_up", ref: popularRef },
                { label: "Events", icon: "event", ref: eventsRef },
              ].map((item) => (
                <button key={item.label} onClick={() => { setMobileOpen(false); setTimeout(() => scrollTo(item.ref), 100); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-on-surface hover:bg-surface-container transition-colors text-left cursor-pointer">
                  <span className="material-symbols-outlined text-outline">{item.icon}</span> {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-outline-variant/30 space-y-3">
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-outline">mail</span> Contact Us
              </Link>
              <Link href="/terms" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-outline">description</span> Terms of Service
              </Link>
              <Link href="/privacy" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-on-surface hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-outline">shield</span> Privacy Policy
              </Link>
            </div>
            <div className="mt-auto pt-6 border-t border-outline-variant/30 space-y-3">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full border border-outline-variant text-on-surface py-2.5 rounded-xl text-sm font-medium hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-lg">login</span> Sign In
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary py-2.5 rounded-xl text-sm font-medium hover:brightness-110 transition-all">
                <span className="material-symbols-outlined text-lg">person_add</span> Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
