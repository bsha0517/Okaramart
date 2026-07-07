import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orderCount, lowStock, todayRevenue] = await Promise.all([
    prisma.order.count({ where: { status: { notIn: ["CANCELLED"] } } }),
    prisma.product.findMany({
      where: { stockQty: { lte: 5 }, isActive: true },
      take: 10,
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        paymentStatus: "PAID",
      },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-canal/10 p-4">
          <p className="text-xs text-char/50">Total orders</p>
          <p className="text-2xl font-semibold">{orderCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-canal/10 p-4">
          <p className="text-xs text-char/50">Today's revenue (paid)</p>
          <p className="text-2xl font-semibold">Rs {Number(todayRevenue._sum.total ?? 0).toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-xl border border-brick/20 p-4">
          <p className="text-xs text-char/50">Low stock items</p>
          <p className="text-2xl font-semibold text-brick">{lowStock.length}</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl border border-canal/10 p-4">
          <h2 className="font-medium mb-3">Needs restocking</h2>
          <ul className="text-sm space-y-1">
            {lowStock.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.name}</span>
                <span className="text-brick">{p.stockQty} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
