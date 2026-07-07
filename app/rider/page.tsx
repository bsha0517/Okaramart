import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RiderOrderCard from "@/components/RiderOrderCard";
import StaffLogoutButton from "@/components/StaffLogoutButton";

export const dynamic = "force-dynamic";

export default async function RiderPage() {
  const session = await getServerSession(authOptions);
  const riderId = (session?.user as any)?.id;

  const [myOrders, unassigned] = await Promise.all([
    prisma.order.findMany({
      where: { riderId, status: { in: ["PACKED", "OUT_FOR_DELIVERY"] } },
      include: { items: { include: { product: true } }, customer: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.findMany({
      where: { riderId: null, status: "PACKED" },
      include: { items: { include: { product: true } }, customer: true },
      orderBy: { createdAt: "asc" },
      take: 20,
    }),
  ]);

  return (
    <div className="min-h-screen bg-husk px-4 py-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-canal">Your deliveries</h1>
        <StaffLogoutButton />
      </div>
      <p className="text-char/60 text-sm mb-6">Okara Mart rider dashboard</p>

      <section className="mb-8">
        <h2 className="font-medium text-sm text-char/70 mb-3">Assigned to you ({myOrders.length})</h2>
        <div className="space-y-3">
          {myOrders.map((o) => <RiderOrderCard key={o.id} order={o} mine />)}
          {myOrders.length === 0 && <p className="text-char/40 text-sm">No active deliveries right now.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-medium text-sm text-char/70 mb-3">Ready to pick up ({unassigned.length})</h2>
        <div className="space-y-3">
          {unassigned.map((o) => <RiderOrderCard key={o.id} order={o} mine={false} />)}
          {unassigned.length === 0 && <p className="text-char/40 text-sm">Nothing waiting for pickup.</p>}
        </div>
      </section>
    </div>
  );
}
