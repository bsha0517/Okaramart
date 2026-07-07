import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return (
    <div className="min-h-screen bg-husk">
      <div className="flex">
        <aside className="w-56 shrink-0 border-r border-canal/10 min-h-screen p-4">
          <p className="font-display text-lg text-canal mb-6">Okara Mart Admin</p>
          <nav className="space-y-1 text-sm">
            <a href="/admin" className="block px-3 py-2 rounded-lg hover:bg-canal/5">Dashboard</a>
            <a href="/admin/orders" className="block px-3 py-2 rounded-lg hover:bg-canal/5">Orders</a>
            {["SUPER_ADMIN", "MANAGER"].includes(role) && (
              <a href="/admin/inventory" className="block px-3 py-2 rounded-lg hover:bg-canal/5">Inventory</a>
            )}
            {["SUPER_ADMIN", "MANAGER"].includes(role) && (
              <a href="/admin/banners" className="block px-3 py-2 rounded-lg hover:bg-canal/5">Banners</a>
            )}
            {["SUPER_ADMIN", "MANAGER"].includes(role) && (
              <a href="/admin/coupons" className="block px-3 py-2 rounded-lg hover:bg-canal/5">Coupons</a>
            )}
            {["SUPER_ADMIN", "MANAGER"].includes(role) && (
              <a href="/admin/analytics" className="block px-3 py-2 rounded-lg hover:bg-canal/5">Analytics</a>
            )}
            {role === "SUPER_ADMIN" && (
              <a href="/admin/users" className="block px-3 py-2 rounded-lg hover:bg-canal/5">Team & roles</a>
            )}
          </nav>
          <p className="mt-8 text-xs text-char/40">Signed in as {role}</p>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
