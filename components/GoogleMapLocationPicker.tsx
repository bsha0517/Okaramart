"use client";

import { useEffect, useRef, useState } from "react";

const OKARA_CENTER = { lat: 30.8081, lng: 73.4534 };
const GOOGLE_MAPS_SCRIPT_ID = "google-maps-script";

export type PickedLocation = { lat: number; lng: number; formattedAddress?: string };

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.maps) return resolve();

    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function GoogleMapLocationPicker({
  onChange,
  initial,
}: {
  onChange: (loc: PickedLocation) => void;
  initial?: PickedLocation;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const [locating, setLocating] = useState(false);
  const [picked, setPicked] = useState<PickedLocation | null>(initial ?? null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setLoadError("Google Maps isn't configured yet — add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.");
      return;
    }

    let cancelled = false;

    loadGoogleMapsScript(apiKey)
      .then(() => {
        if (cancelled || !mapContainerRef.current || mapRef.current) return;
        const google = (window as any).google;

        const startPoint = initial ?? OKARA_CENTER;
        const map = new google.maps.Map(mapContainerRef.current, {
          center: startPoint,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
        });

        const marker = new google.maps.Marker({
          position: startPoint,
          map,
          draggable: true,
        });

        geocoderRef.current = new google.maps.Geocoder();

        function reverseGeocode(lat: number, lng: number) {
          geocoderRef.current.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            const formattedAddress = status === "OK" && results[0] ? results[0].formatted_address : undefined;
            const loc = { lat, lng, formattedAddress };
            setPicked(loc);
            onChange(loc);
          });
        }

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          reverseGeocode(pos.lat(), pos.lng());
        });

        map.addListener("click", (e: any) => {
          marker.setPosition(e.latLng);
          reverseGeocode(e.latLng.lat(), e.latLng.lng());
        });

        // Address search box (Places Autocomplete), biased to Okara
        if (searchInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ["geometry", "formatted_address"],
            componentRestrictions: { country: "pk" },
          });
          autocomplete.bindTo("bounds", map);
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry?.location) return;
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            map.setCenter({ lat, lng });
            map.setZoom(16);
            marker.setPosition({ lat, lng });
            const loc = { lat, lng, formattedAddress: place.formatted_address };
            setPicked(loc);
            onChange(loc);
          });
        }

        mapRef.current = map;
        markerRef.current = marker;
        if (initial) setPicked(initial);
      })
      .catch(() => setLoadError("Couldn't load Google Maps — check the API key and enabled APIs."));

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapRef.current && markerRef.current) {
          mapRef.current.setCenter({ lat, lng });
          mapRef.current.setZoom(16);
          markerRef.current.setPosition({ lat, lng });
          geocoderRef.current?.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
            const formattedAddress = status === "OK" && results[0] ? results[0].formatted_address : undefined;
            const loc = { lat, lng, formattedAddress };
            setPicked(loc);
            onChange(loc);
          });
        }
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  if (loadError) {
    return (
      <div className="border border-brick/20 bg-brick/5 rounded-lg p-4 text-sm text-brick">
        {loadError}
      </div>
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
      <input
        ref={searchInputRef}
        placeholder="Search for an address in Okara…"
        className="w-full border border-canal/20 rounded-lg px-3 py-2 mb-2 text-sm"
      />
      <div
        ref={mapContainerRef}
        className="w-full h-56 rounded-lg border border-canal/20 overflow-hidden"
      />
      {picked && (
        <p className="text-xs text-char/50 mt-1">
          {picked.formattedAddress || `${picked.lat.toFixed(5)}, ${picked.lng.toFixed(5)}`}
        </p>
      )}
    </div>
  );
}
