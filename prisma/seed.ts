import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- Okara delivery zones (edit/add real neighborhoods as you scale) ---
  const zones = [
    { areaName: "Model Town Okara", deliveryFee: 49, etaMinutes: 20 },
    { areaName: "Railway Colony", deliveryFee: 49, etaMinutes: 25 },
    { areaName: "Chuck 2/4-L", deliveryFee: 69, etaMinutes: 30 },
    { areaName: "Depalpur Road", deliveryFee: 79, etaMinutes: 35 },
    { areaName: "Faisal Town Okara", deliveryFee: 49, etaMinutes: 20 },
  ];
  for (const z of zones) {
    await prisma.deliveryZone.upsert({
      where: { areaName: z.areaName },
      update: {},
      create: z,
    });
  }

  // --- Categories ---
  const categories = [
    { name: "Dairy & Eggs", slug: "dairy-eggs" },
    { name: "Fruits & Vegetables", slug: "fruits-vegetables" },
    { name: "Bakery", slug: "bakery" },
    { name: "Snacks", slug: "snacks" },
    { name: "Beverages", slug: "beverages" },
    { name: "Household", slug: "household" },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const dairy = await prisma.category.findUniqueOrThrow({ where: { slug: "dairy-eggs" } });
  const bakery = await prisma.category.findUniqueOrThrow({ where: { slug: "bakery" } });

  // --- Sample products ---
  await prisma.product.upsert({
    where: { sku: "MLK-1L" },
    update: {},
    create: {
      name: "Fresh Milk 1L",
      slug: "fresh-milk-1l",
      unit: "1 litre",
      sku: "MLK-1L",
      price: 220,
      stockQty: 50,
      categoryId: dairy.id,
    },
  });
  await prisma.product.upsert({
    where: { sku: "BRD-WHT" },
    update: {},
    create: {
      name: "White Bread",
      slug: "white-bread",
      unit: "1 loaf",
      sku: "BRD-WHT",
      price: 130,
      stockQty: 30,
      categoryId: bakery.id,
    },
  });

  // --- Default super admin (CHANGE PASSWORD after first login) ---
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
  await prisma.user.upsert({
    where: { phone: "03000000000" },
    update: {},
    create: {
      name: "Store Owner",
      phone: "03000000000",
      role: "SUPER_ADMIN",
      passwordHash,
    },
  });

  console.log("Seed complete. Admin login: 03000000000 / ChangeMe123!");
}

main().finally(() => prisma.$disconnect());
