import { prisma } from "@/lib/prisma";

export default async function BannerStrip() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (banners.length === 0) return null;

  return (
    <section className="mb-8 -mx-4 px-4 overflow-x-auto">
      <div className="flex gap-4 min-w-min">
        {banners.map((b) => (
          <a
            key={b.id}
            href={b.linkUrl || "#"}
            className="shrink-0 w-72 sm:w-80 h-40 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden"
            style={{
              backgroundColor: b.bgColor,
              backgroundImage: b.imageUrl ? `url(${b.imageUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className={b.imageUrl ? "bg-black/30 absolute inset-0" : ""} />
            <div className="relative z-10">
              <h3 className="font-display text-xl text-white font-semibold mb-1">{b.title}</h3>
              {b.subtitle && <p className="text-white/85 text-sm">{b.subtitle}</p>}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
