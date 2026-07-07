import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [orderItems, orders, customers] = await Promise.all([
    prisma.orderItem.findMany({ include: { product: true } }),
    prisma.order.findMany({ where: { status: { not: "CANCELLED" } }, select: { createdAt: true, customerId: true } }),
    prisma.user.findMany({ where: { role: "CUSTOMER" }, select: { id: true } }),
  ]);

  // Best sellers by quantity sold
  const salesByProduct = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const item of orderItems) {
    const key = item.productId;
    const existing = salesByProduct.get(key) || { name: item.product.name, qty: 0, revenue: 0 };
    existing.qty += item.quantity;
    existing.revenue += item.quantity * Number(item.unitPrice);
    salesByProduct.set(key, existing);
  }
  const bestSellers = [...salesByProduct.values()].sort((a, b) => b.qty - a.qty).slice(0, 10);

  // Peak hours — count orders by hour of day (0-23)
  const hourCounts = new Array(24).fill(0);
  for (const o of orders) hourCounts[new Date(o.createdAt).getHours()]++;
  const maxHourCount = Math.max(...hourCounts, 1);

  // Repeat customer rate
  const ordersByCustomer = new Map<string, number>();
  for (const o of orders) ordersByCustomer.set(o.customerId, (ordersByCustomer.get(o.customerId) || 0) + 1);
  const repeatCustomers = [...ordersByCustomer.values()].filter((c) => c > 1).length;
  const totalCustomersWithOrders = ordersByCustomer.size;
  const repeatRate = totalCustomersWithOrders > 0 ? (repeatCustomers / totalCustomersWithOrders) * 100 : 0;

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-6">Analytics</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-canal/10 p-4">
          <p className="text-xs text-char/50">Total customers</p>
          <p className="text-2xl font-semibold">{customers.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-canal/10 p-4">
          <p className="text-xs text-char/50">Customers who ordered</p>
          <p className="text-2xl font-semibold">{totalCustomersWithOrders}</p>
        </div>
        <div className="bg-white rounded-xl border border-canal/10 p-4">
          <p className="text-xs text-char/50">Repeat customer rate</p>
          <p className="text-2xl font-semibold">{repeatRate.toFixed(0)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-canal/10 p-4">
          <h2 className="font-medium mb-3">Best sellers</h2>
          <ul className="space-y-2 text-sm">
            {bestSellers.map((p, i) => (
              <li key={i} className="flex justify-between">
                <span>{p.name}</span>
                <span className="text-char/50">{p.qty} sold · Rs {p.revenue.toFixed(0)}</span>
              </li>
            ))}
            {bestSellers.length === 0 && <p className="text-char/40">No sales yet</p>}
          </ul>
        </div>

        <div className="bg-white rounded-xl border border-canal/10 p-4">
          <h2 className="font-medium mb-3">Peak order hours</h2>
          <div className="flex items-end gap-1 h-32">
            {hourCounts.map((count, hour) => (
              <div key={hour} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full bg-canal rounded-t"
                  style={{ height: `${(count / maxHourCount) * 100}%`, minHeight: count > 0 ? "4px" : "0" }}
                  title={`${hour}:00 — ${count} orders`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-char/40 mt-1">
            <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span><span>11pm</span>
          </div>
        </div>
      </div>
    </div>
  );
}
