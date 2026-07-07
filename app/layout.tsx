import type { Metadata } from "next";
import "./globals.css";
import { getCustomerSession } from "@/lib/customerSession";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartNavLink from "@/components/CartNavLink";
import StickyCartBar from "@/components/StickyCartBar";

export const metadata: Metadata = {
  title: "Okara Mart — Groceries delivered fast in Okara",
  description: "Your local dark store for Okara. Groceries, essentials, delivered in minutes.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getCustomerSession();

  return (
    <html lang="en">
      <body>
        <header className="border-b border-canal/10 bg-husk sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
            <a href="/" className="font-display text-2xl text-canal tracking-tight">
              Okara Mart
            </a>
            <nav className="flex items-center gap-5 text-sm font-medium text-char/80">
              <a href="/about" className="hidden sm:inline hover:text-canal">About</a>
              <a href="/contact" className="hidden sm:inline hover:text-canal">Contact</a>
              {session ? (
                <a href="/account" className="hover:text-canal">Account</a>
              ) : (
                <a href="/login" className="hover:text-canal">Login</a>
              )}
              <CartNavLink />
            </nav>
          </div>
        </header>
        <main className="pb-20">{children}</main>
        <footer className="mt-16 border-t border-canal/10 py-8">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-char/60">
            <span>Okara Mart — serving Okara city only.</span>
            <div className="flex gap-4">
              <a href="/about" className="hover:text-canal">About us</a>
              <a href="/contact" className="hover:text-canal">Contact</a>
              <a href="/account" className="hover:text-canal">My account</a>
            </div>
          </div>
        </footer>
        <WhatsAppButton />
        <StickyCartBar />
      </body>
    </html>
  );
}
