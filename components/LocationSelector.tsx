"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const GoogleMapLocationPicker = dynamic(() => import("./GoogleMapLocationPicker"), {
  ssr: false,
  loading: () => <div className="w-full h-56 rounded-lg bg-canal/5 animate-pulse" />,
});

const PENDING_LOCATION_KEY = "okaramart_pending_location";

export default function LocationSelector({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [savedAddress, setSavedAddress] = useState<{ label: string; area: string; addressLine: string } | null>(null);
  const [picked, setPicked] = useState<{ lat: number; lng: number; formattedAddress?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { setLoaded(true); return; }
    fetch("/api/addresses/default")
      .then((r) => r.json())
      .then((data) => setSavedAddress(data.address))
      .finally(() => setLoaded(true));
  }, [isLoggedIn]);

  async function confirmLocation() {
    if (!picked) return;

    if (!isLoggedIn) {
      // Stash it so signup/login can save it automatically once they're authenticated
      localStorage.setItem(PENDING_LOCATION_KEY, JSON.stringify(picked));
      window.location.href = "/login";
      return;
    }

    setSaving(true);
    const res = await fetch("/api/addresses/default", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: "Current location",
        addressLine: picked.formattedAddress || "Pinned location",
        area: picked.formattedAddress?.split(",")[0] || "Okara",
        lat: picked.lat,
        lng: picked.lng,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setSavedAddress(data.address);
      setOpen(false);
      setPicked(null);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-left shrink-0 hidden sm:block">
        <p className="text-[11px] text-char/50 leading-none flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6.5a2.5 2.5 0 010 5z"/></svg>
          {loaded && savedAddress ? "Deliver to" : "Select Location"}
        </p>
        <p className="text-sm font-semibold text-char leading-tight max-w-[160px] truncate">
          {loaded && savedAddress ? `${savedAddress.area}` : "Choose your area ▾"}
        </p>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-char">Set your delivery location</h2>
              <button onClick={() => setOpen(false)} className="text-char/40 text-xl leading-none">×</button>
            </div>

            <GoogleMapLocationPicker onChange={(loc) => setPicked(loc)} initial={savedAddress ? undefined : undefined} />

            {!isLoggedIn && picked && (
              <p className="text-xs text-char/50 mt-3">
                We'll save this once you sign up or log in — takes 10 seconds.
              </p>
            )}

            <button
              onClick={confirmLocation}
              disabled={!picked || saving}
              className="w-full bg-canal text-husk font-semibold rounded-full py-2.5 mt-4 disabled:opacity-50"
            >
              {saving ? "Saving…" : isLoggedIn ? "Save location" : "Continue"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export { PENDING_LOCATION_KEY };
