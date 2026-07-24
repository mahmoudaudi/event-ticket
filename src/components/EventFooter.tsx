import Link from "next/link";

export default function EventFooter() {
  return (
    <footer className="bg-surface-container-highest mt-[80px]">
      <div className="w-full py-[80px] px-[16px] md:px-[40px] flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-8">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <Link href="/" className="text-[24px] leading-[32px] font-semibold font-headline font-bold text-on-surface">Aurum</Link>
          <p className="text-[14px] leading-[20px] text-on-surface-variant max-w-xs">Elevating the way you discover and book premium experiences.</p>
        </div>
        <div className="flex gap-8">
          <div className="flex flex-col gap-3">
            <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface uppercase tracking-widest mb-1">Company</span>
            <Link href="/contact" className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors">Help Center</Link>
            <Link href="/terms" className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface uppercase tracking-widest mb-1">Legal</span>
            <Link href="/privacy" className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/contact" className="text-[14px] leading-[20px] text-on-surface-variant hover:text-primary transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-outline-variant/30 py-6 px-[16px] md:px-[40px] max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center">
        <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">&copy; 2026 Aurum. All rights reserved.</span>
      </div>
    </footer>
  );
}
