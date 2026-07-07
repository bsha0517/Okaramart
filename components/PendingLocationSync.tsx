"use client";

import { useEffect } from "react";

const KEY = "okaramart_pending_location";

export default function PendingLocationSync() {
  useEffect(() => {
    const pending = localStorage.getItem(KEY);
    if (!pending) return;

    (async () => {
      try {
        const loc = JSON.parse(pending);
        const res = await fetch("/api/addresses/default", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: "Current location",
            addressLine: loc.formattedAddress || "Pinned location",
            area: loc.formattedAddress?.split(",")[0] || "Okara",
            lat: loc.lat,
            lng: loc.lng,
          }),
        });
        // Only clear it once it's actually saved — if the person isn't
        // logged in yet (401), keep it for the next page load after login.
        if (res.ok) localStorage.removeItem(KEY);
      } catch {
        // best-effort — leave it in storage to retry next load
      }
    })();
  }, []);

  return null;
}
