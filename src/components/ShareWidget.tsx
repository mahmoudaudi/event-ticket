export default function ShareWidget() {
  return (
    <div className="flex justify-between items-center px-4 py-2 border border-outline-variant/20 rounded-lg">
      <span className="text-[12px] leading-[16px] tracking-[0.05em] font-semibold text-on-surface-variant">Share this event</span>
      <div className="flex gap-4">
        <button className="hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined text-[20px]">share</span></button>
        <button className="hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined text-[20px]">bookmark</span></button>
      </div>
    </div>
  );
}
