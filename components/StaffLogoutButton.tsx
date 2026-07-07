"use client";

import { signOut } from "next-auth/react";

export default function StaffLogoutButton() {
  async function handleLogout() {
    await signOut({ redirect: false });
    // Hard reload guarantees the cleared session is reflected immediately.
    window.location.href = "/staff-login";
  }

  return (
    <button onClick={handleLogout} className="text-brick text-sm font-medium">
      Log out
    </button>
  );
}
