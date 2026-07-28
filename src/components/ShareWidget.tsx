"use client";

export default function ShareWidget() {
  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: document.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-2 border border-outline-variant/20 rounded-lg">
      <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">Share this event</span>
      <div className="flex gap-4">
        <button onClick={share} className="hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined text-[20px]">share</span></button>
      </div>
    </div>
  );
}
