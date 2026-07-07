-- Okara Mart — starter data
-- Run this after 01_create_tables.sql succeeds

-- Delivery zones
insert into "DeliveryZone" ("areaName", "deliveryFee", "etaMinutes") values
  ('Model Town Okara', 49, 20),
  ('Railway Colony', 49, 25),
  ('Chuck 2/4-L', 69, 30),
  ('Depalpur Road', 79, 35),
  ('Faisal Town Okara', 49, 20)
on conflict ("areaName") do nothing;

-- Categories
insert into "Category" (name, slug) values
  ('Dairy & Eggs', 'dairy-eggs'),
  ('Fruits & Vegetables', 'fruits-vegetables'),
  ('Bakery', 'bakery'),
  ('Snacks', 'snacks'),
  ('Beverages', 'beverages'),
  ('Household', 'household')
on conflict (slug) do nothing;

-- Sample products
insert into "Product" (name, slug, unit, sku, price, "stockQty", "categoryId")
select 'Fresh Milk 1L', 'fresh-milk-1l', '1 litre', 'MLK-1L', 220, 50, id
from "Category" where slug = 'dairy-eggs'
on conflict (sku) do nothing;

insert into "Product" (name, slug, unit, sku, price, "stockQty", "categoryId")
select 'White Bread', 'white-bread', '1 loaf', 'BRD-WHT', 130, 30, id
from "Category" where slug = 'bakery'
on conflict (sku) do nothing;

-- Admin login — phone: 03000000000, password: ChangeMe123!
-- (uses Postgres's built-in bcrypt so it matches bcryptjs on the app side)
insert into "User" (name, phone, role, "passwordHash")
values ('Store Owner', '03000000000', 'SUPER_ADMIN', crypt('ChangeMe123!', gen_salt('bf', 10)))
on conflict (phone) do nothing;
