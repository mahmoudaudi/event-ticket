"use client";

import { useState } from "react";

export default function ShareWidget() {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
      } catch {
        // user cancelled or error — ignore
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback if clipboard not available
      }
    }
  };

  return (
    <div className="flex justify-between items-center px-4 py-2 border border-outline-variant/20 rounded-lg">
      <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">Share this event</span>
      <div className="flex gap-4">
        <button onClick={share} className="hover:text-primary transition-colors cursor-pointer relative">
          <span className="material-symbols-outlined text-[20px]">{copied ? "check" : "share"}</span>
          {copied && (
            <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-on-primary px-1 rounded-full whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
