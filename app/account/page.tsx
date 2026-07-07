import { prisma } from "@/lib/prisma";
import { getUnifiedCustomerSession } from "@/lib/customerSession";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PLACED: "Placed", CONFIRMED: "Confirmed", PACKING: "Packing", PACKED: "Packed",
  OUT_FOR_DELIVERY: "Out for delivery", DELIVERED: "Delivered", CANCELLED: "Cancelled", RETURNED: "Returned",
};

export default async function AccountPage() {
  const session = await getUnifiedCustomerSession();
  if (!session) redirect("/login");

  const [user, orders, addresses] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.order.findMany({
      where: { customerId: session.userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.address.findMany({ where: { userId: session.userId } }),
  ]);

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl text-canal mb-1">My account</h1>
      <div className="flex items-center justify-between mb-8">
        <p className="text-char/60">{user.name} · {user.phone}{user.email ? ` · ${user.email}` : ""}</p>
        <LogoutButton />
      </div>

      <section className="mb-10">
        <h2 className="font-medium mb-3">Saved addresses</h2>
        {addresses.length === 0 ? (
          <p className="text-char/50 text-sm">No saved addresses yet — one gets added the first time you check out.</p>
        ) : (
          <div className="space-y-2">
            {addresses.map((a) => (
              <div key={a.id} className="bg-white border border-canal/10 rounded-lg p-3 text-sm">
                <p className="font-medium">{a.label}</p>
                <p className="text-char/60">{a.addressLine}, {a.area}, Okara</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-medium mb-3">Order history</h2>
        {orders.length === 0 ? (
          <p className="text-char/50 text-sm">
            No orders yet. <a href="/" className="text-canal underline">Start shopping</a>
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-white border border-canal/10 rounded-lg p-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium">{o.orderNumber}</p>
                  <span className="text-xs bg-canal/10 text-canal rounded-full px-2 py-1 font-medium">
                    {STATUS_LABEL[o.status]}
                  </span>
                </div>
                <p className="text-xs text-char/50">
                  {o.items.length} items · Rs {Number(o.total).toFixed(0)} · {new Date(o.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
