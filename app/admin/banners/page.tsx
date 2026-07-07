import { prisma } from "@/lib/prisma";
import BannerForm from "@/components/BannerForm";
import BannerRow from "@/components/BannerRow";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display text-2xl text-canal mb-2">Homepage banners</h1>
      <p className="text-char/60 text-sm mb-6">
        These appear as the promo strip on the homepage, in order. Link URL is optional —
        e.g. <code className="bg-canal/5 px-1 rounded">/?category=snacks</code> to send
        customers straight to a category.
      </p>

      <div className="mb-8">
        <BannerForm />
      </div>

      <div className="space-y-2">
        {banners.map((b) => (
          <BannerRow key={b.id} banner={b} />
        ))}
        {banners.length === 0 && <p className="text-char/40 text-sm">No banners yet — add one above.</p>}
      </div>
    </div>
  );
}
