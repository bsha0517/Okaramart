"use client";

import { useEffect, useRef, useState } from "react";

// Okara city center — used as the map's default view
const OKARA_CENTER: [number, number] = [30.8081, 73.4534];

export type PickedLocation = { lat: number; lng: number };

export default function MapLocationPicker({
  onChange,
  initial,
}: {
  onChange: (loc: PickedLocation) => void;
  initial?: PickedLocation;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [locating, setLocating] = useState(false);
  const [picked, setPicked] = useState<PickedLocation | null>(initial ?? null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Leaflet touches `window`, so it's loaded dynamically client-side only
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css" as any);
      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      const startPoint = initial ? [initial.lat, initial.lng] : OKARA_CENTER;

      const map = L.map(mapContainerRef.current).setView(startPoint as [number, number], 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker(startPoint as [number, number], { draggable: true }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        const loc = { lat: pos.lat, lng: pos.lng };
        setPicked(loc);
        onChange(loc);
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        const loc = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPicked(loc);
        onChange(loc);
      });

      mapRef.current = map;
      markerRef.current = marker;

      if (initial) {
        setPicked(initial);
      }
    }

    init();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPicked(loc);
        onChange(loc);
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([loc.lat, loc.lng], 16);
          markerRef.current.setLatLng([loc.lat, loc.lng]);
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-char">Pin your delivery location</label>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="text-xs text-canal font-medium disabled:opacity-50"
        >
          {locating ? "Locating…" : "Use my current location"}
        </button>
      </div>
      <div
        ref={mapContainerRef}
        className="w-full h-56 rounded-lg border border-canal/20 overflow-hidden"
      />
      {picked && (
        <p className="text-xs text-char/50 mt-1">
          {picked.lat.toFixed(5)}, {picked.lng.toFixed(5)} — drag the pin or tap the map to adjust
        </p>
      )}
    </div>
  );
}
