"use client";

import { useMemo } from "react";
import Link from "next/link";
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from "@react-google-maps/api";

interface EventItem {
  _id: string;
  title: string;
  lat?: number | null;
  lng?: number | null;
}

const containerStyle = { width: "100%", height: "400px" };
const defaultCenter = { lat: 40.7128, lng: -74.006 }; // NYC fallback

export default function EventsMap({ events }: { events?: EventItem[] }) {
  const items = events ?? [];
  const withCoords = items.filter((e) => e.lat && e.lng);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const center = useMemo(() => {
    if (withCoords.length > 0) {
      // Average of all event coordinates
      const sumLat = withCoords.reduce((s, e) => s + (e.lat ?? 0), 0);
      const sumLng = withCoords.reduce((s, e) => s + (e.lng ?? 0), 0);
      return { lat: sumLat / withCoords.length, lng: sumLng / withCoords.length };
    }
    return defaultCenter;
  }, [withCoords]);

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-surface-container flex items-center justify-center">
        <p className="text-on-surface-variant animate-pulse">Loading map...</p>
      </div>
    );
  }

  if (withCoords.length === 0) {
    return (
      <div className="w-full h-[400px] rounded-2xl bg-surface-container flex items-center justify-center">
        <p className="text-on-surface-variant">No event locations available yet.</p>
      </div>
    );
  }

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={withCoords.length > 1 ? 10 : 12}>
      {withCoords.map((event) => (
        <Marker
          key={event._id}
          position={{ lat: event.lat!, lng: event.lng! }}
          title={event.title}
          onClick={() => {
            window.location.href = `/events/${event._id}`;
          }}
        />
      ))}
    </GoogleMap>
  );
}
