interface VenueMapProps {
  venue: string;
  location: string;
}

export default function VenueMap({ venue, location }: VenueMapProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(30,41,59,0.05)] border border-outline-variant/30 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold font-headline text-on-surface">Venue Location</h2>
        <a href={`https://maps.google.com/?q=${encodeURIComponent(venue + " " + location)}`} target="_blank" rel="noopener noreferrer" className="text-primary text-[14px] leading-[20px] tracking-[0.02em] font-medium hover:underline">Get Directions</a>
      </div>
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden bg-secondary-container/20 flex items-center justify-center">
        <div className="absolute inset-0 bg-secondary-container/20" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <span className="material-symbols-outlined text-on-primary">location_on</span>
          </div>
          <div className="mt-2 px-3 py-1 bg-on-surface text-surface rounded text-[12px] leading-[16px] tracking-[0.05em] font-semibold shadow-md">
            {venue}
          </div>
        </div>
      </div>
    </div>
  );
}
