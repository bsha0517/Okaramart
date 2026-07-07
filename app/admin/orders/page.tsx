import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PLACED: "bg-wheat/30 text-char",
  CONFIRMED: "bg-canal/10 text-canal",
  PACKING: "bg-canal/10 text-canal",
  PACKED: "bg-canal/20 text-canal",
  OUT_FOR_DELIVERY: "bg-canal text-husk",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-brick/10 text-brick",
  RETURNED: "bg-brick/10 text-brick",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { customer: true, items: true },
  });

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-6">Orders</h1>
      <div className="bg-white rounded-xl border border-canal/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-husk text-left text-char/60">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-canal/5 hover:bg-canal/5 cursor-pointer relative">
                <td className="px-4 py-3 font-medium">
                  <a href={`/admin/orders/${o.id}`} className="absolute inset-0" aria-hidden />
                  <a href={`/admin/orders/${o.id}`} className="hover:underline">{o.orderNumber}</a>
                </td>
                <td className="px-4 py-3">{o.customer.name}</td>
                <td className="px-4 py-3">{o.items.length} items</td>
                <td className="px-4 py-3">Rs {Number(o.total).toFixed(0)}</td>
                <td className="px-4 py-3">{o.paymentMethod} · {o.paymentStatus}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                    {o.status.replace(/_/g, " ")}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-char/40">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
