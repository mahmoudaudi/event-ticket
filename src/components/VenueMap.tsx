interface VenueMapProps {
  venue: string;
  location: string;
}

export default function VenueMap({ venue, location }: VenueMapProps) {
  const query = encodeURIComponent(`${venue} ${location}`);
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_4px_20px_rgba(30,41,59,0.05)] border border-outline-variant/30 overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[30px] leading-[38px] tracking-[-0.01em] font-semibold font-headline text-on-surface">Venue Location</h2>
        <a href={`https://maps.google.com/?q=${query}`} target="_blank" rel="noopener noreferrer" className="text-primary text-[14px] leading-[20px] tracking-[0.02em] font-medium hover:underline">Get Directions</a>
      </div>
      <div className="w-full h-[300px] rounded-lg overflow-hidden">
        <iframe
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={venue}
        />
      </div>
    </div>
  );
}
