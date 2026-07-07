import { prisma } from "@/lib/prisma";

export default async function DeliveryEtaBadge() {
  const fastestZone = await prisma.deliveryZone.findFirst({
    where: { isActive: true },
    orderBy: { etaMinutes: "asc" },
  });

  const eta = fastestZone?.etaMinutes ?? 30;

  return (
    <div className="inline-flex items-center gap-2 bg-canal text-husk rounded-full px-4 py-2 mb-4 text-sm font-semibold">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Delivery in as fast as {eta} minutes
    </div>
  );
}
