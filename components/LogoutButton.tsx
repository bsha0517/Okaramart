"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  async function handleLogout() {
    // Clears whichever session type is active — password-login cookie
    // and/or a Google/Facebook NextAuth session.
    await fetch("/api/auth/logout", { method: "POST" });
    await signOut({ redirect: false });
    // Hard reload, not router.push — guarantees the cleared cookie is
    // reflected immediately instead of showing stale cached state.
    window.location.href = "/";
  }

  return (
    <button onClick={handleLogout} className="text-brick text-sm font-medium">
      Log out
    </button>
  );
}
