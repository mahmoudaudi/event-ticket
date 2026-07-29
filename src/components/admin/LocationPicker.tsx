"use client";

import { useRef, useState, useEffect } from "react";

declare global {
  interface Window {
    google?: typeof google;
    initGoogleMaps?: () => void;
  }
}

interface LocationPickerProps {
  venue: string;
  address: string;
  city: string;
  onChange: (fields: { venue: string; address: string; city: string; lat?: number; lng?: number }) => void;
}

export function LocationPicker({ venue, address, city, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.google?.maps) {
      setLoaded(true);
      return;
    }
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setLoadError(true);
      return;
    }
    window.initGoogleMaps = () => setLoaded(true);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => setLoadError(true);
    document.head.appendChild(script);

    // Timeout after 10s
    const timer = setTimeout(() => {
      if (!window.google?.maps) setLoadError(true);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || map) return;
    const m = new window.google!.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    setMap(m);

    const mk = new window.google!.maps.Marker({ map: m, draggable: true });
    setMarker(mk);

    if (inputRef.current) {
      const autocomplete = new window.google!.maps.places.Autocomplete(inputRef.current, {
        types: ["establishment"],
        fields: ["formatted_address", "geometry", "name", "address_components"],
      });
      autocomplete.bindTo("bounds", m);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry?.location) return;
        m.setCenter(place.geometry.location);
        m.setZoom(15);
        mk.setPosition(place.geometry.location);
        const street = place.address_components?.find((c) => c.types.includes("route"))?.long_name || "";
        const cityComp = place.address_components?.find((c) => c.types.includes("locality"))?.long_name || "";
        onChange({
          venue: place.name || "",
          address: street,
          city: cityComp,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      });
    }

    // Click on map to place marker
    m.addListener("click", (e: google.maps.MapMouseEvent) => {
      const pos = e.latLng;
      if (!pos) return;
      mk.setPosition(pos);
      const geocoder = new window.google!.maps.Geocoder();
      geocoder.geocode({ location: pos }, (results) => {
        if (!results?.[0]) return;
        const street = results[0].address_components?.find((c) => c.types.includes("route"))?.long_name || "";
        const cityComp = results[0].address_components?.find((c) => c.types.includes("locality"))?.long_name || "";
        const name = results[0].address_components?.find((c) => c.types.includes("establishment"))?.long_name || "";
        onChange({ venue: name || results[0].formatted_address, address: street, city: cityComp, lat: pos.lat(), lng: pos.lng() });
      });
    });

    // When marker is dragged, reverse geocode
    mk.addListener("dragend", () => {
      const pos = mk.getPosition();
      if (!pos) return;
      const geocoder = new window.google!.maps.Geocoder();
      geocoder.geocode({ location: pos }, (results) => {
        if (!results?.[0]) return;
        const street = results[0].address_components?.find((c) => c.types.includes("route"))?.long_name || "";
        const cityComp = results[0].address_components?.find((c) => c.types.includes("locality"))?.long_name || "";
        const name = results[0].address_components?.find((c) => c.types.includes("establishment"))?.long_name || "";
        onChange({ venue: name || results[0].formatted_address, address: street, city: cityComp, lat: pos.lat(), lng: pos.lng() });
      });
    });
  }, [loaded]);

  // If initial values exist, geocode them on mount
  useEffect(() => {
    if (!loaded || !map || !marker || !venue && !address && !city) return;
    const query = [venue, address, city].filter(Boolean).join(" ");
    if (!query) return;
    const geocoder = new window.google!.maps.Geocoder();
    geocoder.geocode({ address: query }, (results) => {
      if (!results?.[0]?.geometry?.location) return;
      map.setCenter(results[0].geometry.location);
      map.setZoom(15);
      marker.setPosition(results[0].geometry.location);
    });
  }, [loaded, map, marker]);

  if (!loaded && !loadError) {
    return (
      <div className="w-full h-[350px] rounded-lg bg-surface-container flex items-center justify-center">
        <p className="text-sm text-on-surface-variant animate-pulse">Loading map...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <div className="w-full h-[350px] rounded-lg bg-surface-container flex items-center justify-center border border-outline-variant">
          <div className="text-center px-6">
            <p className="text-sm text-on-surface-variant mb-1">Google Maps could not load.</p>
            <p className="text-xs text-on-surface-variant">Enter location manually below.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">Venue</label>
            <input value={venue} onChange={(e) => onChange({ venue: e.target.value, address, city })}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-medium text-on-surface mb-1">City</label>
            <input value={city} onChange={(e) => onChange({ venue, address, city: e.target.value })}
              className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-on-surface mb-1">Address</label>
          <input value={address} onChange={(e) => onChange({ venue, address: e.target.value, city })}
            className="w-full rounded-lg border border-outline-variant bg-surface px-3.5 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a venue or place..."
          className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/60 outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>
      <div ref={mapRef} className="w-full h-[350px] rounded-lg border border-outline-variant overflow-hidden" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-on-surface-variant">
        <div><span className="font-medium text-on-surface">Venue:</span> {venue || "—"}</div>
        <div><span className="font-medium text-on-surface">Address:</span> {address || "—"}</div>
        <div><span className="font-medium text-on-surface">City:</span> {city || "—"}</div>
      </div>
    </div>
  );
}
