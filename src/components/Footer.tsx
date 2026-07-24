"use client";
import Link from "next/link";

interface FooterProps {
  scrollTo: (ref: React.RefObject<HTMLDivElement | HTMLHeadingElement | null>) => void;
  eventsRef: React.RefObject<HTMLDivElement | null>;
}

export default function Footer({ scrollTo, eventsRef }: FooterProps) {
  return (
    <footer className="bg-surface-container-highest border-t border-outline-variant/30">
      <div className="w-full py-[80px] px-[16px] md:px-[40px] flex flex-col md:flex-row justify-between items-start md:items-center max-w-[1280px] mx-auto gap-8">
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-[24px] leading-[32px] font-semibold font-headline font-bold text-on-surface">Aurum</Link>
          <p className="text-[14px] leading-[20px] text-on-surface-variant max-w-xs">Connecting the world through curated, high-end experiences since 2024.</p>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-8">
          <div className="flex flex-col gap-3">
            <h5 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface font-bold uppercase tracking-widest">Platform</h5>
            <button onClick={() => scrollTo(eventsRef)} className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left cursor-pointer">Browse Events</button>
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface font-bold uppercase tracking-widest">Company</h5>
            <Link href="/contact" className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left">Contact Us</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h5 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface font-bold uppercase tracking-widest">Legal</h5>
            <Link href="/terms" className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left">Terms of Service</Link>
            <Link href="/privacy" className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left">Privacy Policy</Link>
            <Link href="/cookie-policy" className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant hover:text-primary transition-colors text-left">Cookie Policy</Link>
          </div>
        </div>
      </div>
      <div className="px-[16px] md:px-[40px] py-8 border-t border-outline-variant/20 max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-[14px] leading-[20px] text-on-surface-variant opacity-80">&copy; 2026 Aurum. All rights reserved.</span>
      </div>
    </footer>
  );
}
