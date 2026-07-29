"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface EventItem {
  _id: string;
  title: string;
  venue?: string;
  city?: string;
  address?: string;
  lat?: number | null;
  lng?: number | null;
}

const containerStyle = { width: "100%", height: "400px" };
const defaultCenter = { lat: 40.7128, lng: -74.006 };

export default function EventsMap({ events }: { events?: EventItem[] }) {
  const items = events ?? [];
  const [coordsMap, setCoordsMap] = useState<Record<string, { lat: number; lng: number }>>({});
  const geocodingRef = useRef(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  // Client-side geocoding for events without coordinates
  useEffect(() => {
    if (!isLoaded || geocodingRef.current) return;
    geocodingRef.current = true;

    const geocoder = new google.maps.Geocoder();
    const toGeocode = items.filter((e) => !e.lat && !e.lng && (e.venue || e.city));

    toGeocode.forEach((event) => {
      const address = [event.venue, event.address, event.city].filter(Boolean).join(", ");
      if (!address) return;

      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results?.[0]?.geometry?.location) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          setCoordsMap((prev) => ({ ...prev, [event._id]: { lat, lng } }));

          // Persist to DB
          fetch(`/api/events/${event._id}/geocode`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat, lng }),
          }).catch(() => {});
        }
      });
    });
  }, [isLoaded, items]);

  const withCoords = useMemo(() => {
    const all = items.map((e) => {
      if (e.lat && e.lng) return e;
      const c = coordsMap[e._id];
      if (c) return { ...e, lat: c.lat, lng: c.lng };
      return e;
    });
    return all.filter((e) => e.lat && e.lng);
  }, [items, coordsMap]);

  const center = useMemo(() => {
    if (withCoords.length > 0) {
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
