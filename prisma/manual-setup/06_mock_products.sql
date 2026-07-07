-- Sample products for demo/testing — every SKU is prefixed "MOCK-" and every
-- description says so, making them trivial to find and delete later:
--
--   delete from "Product" where sku like 'MOCK-%';
--
-- Run this in Supabase SQL Editor. Safe to run once; re-running just updates
-- the same rows (matched by SKU) rather than duplicating them.

insert into "Product" (name, slug, unit, sku, price, "compareAtPrice", "stockQty", description, "categoryId")
select 'Nestlé Fresh Milk 1L', 'nestle-fresh-milk-1l', '1 litre', 'MOCK-MLK-002', 250, 280, 40,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'dairy-eggs'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Farm Eggs (Dozen)', 'farm-eggs-dozen', '12 pcs', 'MOCK-EGG-001', 320, 60,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'dairy-eggs'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "compareAtPrice", "stockQty", description, "categoryId")
select 'Nurpur Butter 200g', 'nurpur-butter-200g', '200 g', 'MOCK-BTR-001', 480, 520, 25,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'dairy-eggs'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Bananas', 'bananas', '1 dozen', 'MOCK-FRT-001', 150, 80,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'fruits-vegetables'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Tomatoes', 'tomatoes', '1 kg', 'MOCK-VEG-001', 90, 100,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'fruits-vegetables'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Onions', 'onions', '1 kg', 'MOCK-VEG-002', 110, 90,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'fruits-vegetables'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "compareAtPrice", "stockQty", description, "categoryId")
select 'Potatoes', 'potatoes', '2 kg', 'MOCK-VEG-003', 140, 160, 70,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'fruits-vegetables'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Brown Bread', 'brown-bread', '1 loaf', 'MOCK-BRD-002', 150, 25,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'bakery'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Butter Croissants (4pc)', 'butter-croissants-4pc', '4 pcs', 'MOCK-BKR-001', 320, 15,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'bakery'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "compareAtPrice", "stockQty", description, "categoryId")
select 'Lays Chips Classic', 'lays-chips-classic', '1 pack', 'MOCK-SNK-001', 100, 120, 120,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'snacks'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Oreo Biscuits', 'oreo-biscuits', '1 pack', 'MOCK-SNK-002', 130, 90,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'snacks'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Kurkure Masala Munch', 'kurkure-masala-munch', '1 pack', 'MOCK-SNK-003', 60, 150,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'snacks'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "compareAtPrice", "stockQty", description, "categoryId")
select 'Coca-Cola 1.5L', 'coca-cola-1-5l', '1.5 litre', 'MOCK-BEV-001', 180, 200, 60,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'beverages'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Fresh Orange Juice 1L', 'fresh-orange-juice-1l', '1 litre', 'MOCK-BEV-002', 260, 35,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'beverages'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Mineral Water (6-pack)', 'mineral-water-6-pack', '6 x 1.5L', 'MOCK-BEV-003', 350, 45,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'beverages'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "compareAtPrice", "stockQty", description, "categoryId")
select 'Surf Excel Detergent 1kg', 'surf-excel-detergent-1kg', '1 kg', 'MOCK-HH-001', 420, 460, 30,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'household'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Dettol Handwash 250ml', 'dettol-handwash-250ml', '250 ml', 'MOCK-HH-002', 240, 55,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'household'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";

insert into "Product" (name, slug, unit, sku, price, "stockQty", description, "categoryId")
select 'Harpic Toilet Cleaner 500ml', 'harpic-toilet-cleaner-500ml', '500 ml', 'MOCK-HH-003', 280, 40,
  'Sample product — safe to delete once you add real inventory.', id
from "Category" where slug = 'household'
on conflict (sku) do update set price = excluded.price, "stockQty" = excluded."stockQty";
