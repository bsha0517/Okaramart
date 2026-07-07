import { prisma } from "@/lib/prisma";
import ZoneForm from "@/components/ZoneForm";
import ZoneRow from "@/components/ZoneRow";

export const dynamic = "force-dynamic";

export default async function ZonesPage() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: { areaName: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-2">Delivery areas</h1>
      <p className="text-char/60 text-sm mb-6">
        These also power the public "Delivery Areas" page and the delivery-time badge on the homepage.
      </p>

      <div className="mb-8">
        <ZoneForm />
      </div>

      <div className="bg-white rounded-xl border border-canal/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-husk text-left text-char/60">
            <tr>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Delivery fee</th>
              <th className="px-4 py-3">ETA (minutes)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => <ZoneRow key={z.id} zone={z} />)}
            {zones.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-char/40">No delivery areas yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
