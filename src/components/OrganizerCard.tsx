interface OrganizerCardProps {
  organizer: string;
}

export default function OrganizerCard({ organizer }: OrganizerCardProps) {
  return (
    <div className="bg-surface-container p-4 rounded-xl border border-outline-variant/30 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary">theater_comedy</span>
      </div>
      <div>
        <h5 className="text-[14px] leading-[20px] tracking-[0.02em] font-medium text-on-surface">Organized by</h5>
        <p className="text-[14px] leading-[20px] font-semibold text-primary">{organizer}</p>
      </div>
      <button className="ml-auto p-2 hover:bg-surface rounded-full transition-colors cursor-pointer">
        <span className="material-symbols-outlined text-on-surface-variant">chat_bubble</span>
      </button>
    </div>
  );
}
