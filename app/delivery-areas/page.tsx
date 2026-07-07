import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DeliveryAreasPage() {
  const zones = await prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { areaName: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl text-canal mb-2">Delivery areas</h1>
      <p className="text-char/70 mb-8">
        We currently deliver across these areas of Okara city. Don't see yours? We're
        expanding coverage regularly — <a href="/contact" className="text-canal underline">let us know</a>.
      </p>

      <div className="bg-white border border-canal/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-husk text-left text-char/60">
            <tr>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Delivery fee</th>
              <th className="px-4 py-3">Estimated time</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="border-t border-canal/5">
                <td className="px-4 py-3 font-medium">{z.areaName}</td>
                <td className="px-4 py-3">Rs {Number(z.deliveryFee).toFixed(0)}</td>
                <td className="px-4 py-3">{z.etaMinutes} minutes</td>
              </tr>
            ))}
            {zones.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-char/40">Coverage areas coming soon</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
