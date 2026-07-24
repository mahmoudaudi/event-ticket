"use client";

interface BackToTopProps {
  show: boolean;
}

export default function BackToTop({ show }: BackToTopProps) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center transition-all duration-300 cursor-pointer hover:shadow-xl hover:brightness-110 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      aria-label="Back to top"
    >
      <span className="material-symbols-outlined">arrow_upward</span>
    </button>
  );
}
