import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { getCustomerSession } from "@/lib/customerSession";
import WhatsAppButton from "@/components/WhatsAppButton";
import CartNavLink from "@/components/CartNavLink";
import StickyCartBar from "@/components/StickyCartBar";
import SearchBar from "@/components/SearchBar";
import LocationSelector from "@/components/LocationSelector";
import SocialLinks from "@/components/SocialLinks";

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
          <div className="max-w-6xl mx-auto flex items-center gap-4 px-4 py-3">
            <a href="/" className="shrink-0">
              <p className="font-display text-2xl text-canal tracking-tight leading-none">Okara Mart</p>
              <p className="text-[11px] text-char/50 leading-none mt-0.5">Delivery in minutes*</p>
            </a>

            <LocationSelector isLoggedIn={!!session} />

            <Suspense fallback={<div className="flex-1" />}>
              <SearchBar />
            </Suspense>

            <nav className="flex items-center gap-5 text-sm font-medium text-char/80 shrink-0">
              <a href="/about" className="hidden md:inline hover:text-canal">About</a>
              <a href="/contact" className="hidden md:inline hover:text-canal">Contact</a>
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

        <footer className="mt-16 border-t border-canal/10 py-10 bg-white">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              <p className="font-display text-xl text-canal mb-3">Okara Mart</p>
              <p className="text-xs text-char/50 mb-4">
                Serving Okara city only. A local dark store for groceries and daily essentials.
              </p>
              <SocialLinks />
            </div>
            <div>
              <p className="font-semibold text-sm text-char mb-3">Company</p>
              <ul className="space-y-2 text-sm text-char/60">
                <li><a href="/" className="hover:text-canal">Home</a></li>
                <li><a href="/about" className="hover:text-canal">About us</a></li>
                <li><a href="/delivery-areas" className="hover:text-canal">Delivery areas</a></li>
                <li><a href="/careers" className="hover:text-canal">Careers</a></li>
                <li><a href="/sell-with-us" className="hover:text-canal">Sell on Okara Mart</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm text-char mb-3">Support</p>
              <ul className="space-y-2 text-sm text-char/60">
                <li><a href="/customer-support" className="hover:text-canal">Customer support</a></li>
                <li><a href="/contact" className="hover:text-canal">Contact</a></li>
                <li>JazzCash · EasyPaisa · COD</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm text-char mb-3">Legal</p>
              <ul className="space-y-2 text-sm text-char/60">
                <li><a href="/privacy-policy" className="hover:text-canal">Privacy Policy</a></li>
                <li><a href="/terms-of-use" className="hover:text-canal">Terms of Use</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-sm text-char mb-3">Account</p>
              <ul className="space-y-2 text-sm text-char/60">
                <li><a href="/account" className="hover:text-canal">My account</a></li>
                <li><a href="/cart" className="hover:text-canal">Cart</a></li>
                <li><a href="/login" className="hover:text-canal">Login / Sign up</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-canal/5 text-xs text-char/40">
            © {new Date().getFullYear()} Okara Mart. All rights reserved.
          </div>
        </footer>

        <WhatsAppButton />
        <StickyCartBar />
      </body>
    </html>
  );
}
