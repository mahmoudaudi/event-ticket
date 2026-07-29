import "server-only";

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_CLIENT_ID
    ? null // No dedicated Geocoding API key; we'll try a simpler approach
    : null;

  // Fall back to a best-effort coordinate using Google's Geocoding API
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
      return data.results[0].geometry.location;
    }
  } catch {
    // Silently fail — coordinates are optional
  }

  return null;
}
