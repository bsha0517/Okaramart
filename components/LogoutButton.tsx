"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    // Clears whichever session type is active — password-login cookie
    // and/or a Google/Facebook NextAuth session.
    await fetch("/api/auth/logout", { method: "POST" });
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-brick text-sm font-medium">
      Log out
    </button>
  );
}
