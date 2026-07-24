export default function EventHighlights() {
  return (
    <div className="mt-6 pt-6 border-t border-outline-variant/30">
      <h3 className="text-[24px] leading-[32px] font-semibold font-headline text-on-surface mb-4">Event Highlights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-4 bg-surface rounded-lg">
          <span className="material-symbols-outlined text-primary mt-1">wine_bar</span>
          <div>
            <h4 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface">Complimentary Reception</h4>
            <p className="text-[12px] leading-[16px] tracking-[0.05em] text-on-surface-variant">Arrival drinks and hors d&apos;oeuvres starting at 7:00 PM.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-surface rounded-lg">
          <span className="material-symbols-outlined text-primary mt-1">auto_awesome</span>
          <div>
            <h4 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface">Digital Program</h4>
            <p className="text-[12px] leading-[16px] tracking-[0.05em] text-on-surface-variant">Exclusive artist commentary accessible via the app.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
