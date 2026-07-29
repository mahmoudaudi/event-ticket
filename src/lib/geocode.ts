import "server-only";

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Try Google Geocoding API first (if key is available)
    const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (googleKey) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
        return data.results[0].geometry.location;
      }
    }

    // Fallback: OpenStreetMap Nominatim (free, no key required)
    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const osmRes = await fetch(osmUrl, {
      headers: { "User-Agent": "AurumEventApp/1.0" },
    });
    const osmData = await osmRes.json();
    if (Array.isArray(osmData) && osmData[0]?.lat && osmData[0]?.lon) {
      return { lat: parseFloat(osmData[0].lat), lng: parseFloat(osmData[0].lon) };
    }
  } catch {
    // Silently fail
  }

  return null;
}
