import { prisma } from "@/lib/prisma";
import CouponForm from "@/components/CouponForm";
import CouponToggle from "@/components/CouponToggle";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { code: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-6">Coupons</h1>

      <div className="mb-8">
        <CouponForm />
      </div>

      <div className="bg-white rounded-xl border border-canal/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-husk text-left text-char/60">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min order</th>
              <th className="px-4 py-3">Uses</th>
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-t border-canal/5">
                <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                <td className="px-4 py-3">
                  {c.discountType === "PERCENT" ? `${c.discountValue}%` : `Rs ${Number(c.discountValue).toFixed(0)}`}
                </td>
                <td className="px-4 py-3">Rs {Number(c.minOrderValue).toFixed(0)}</td>
                <td className="px-4 py-3">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                <td className="px-4 py-3">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3"><CouponToggle id={c.id} isActive={c.isActive} /></td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-char/40">No coupons yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
