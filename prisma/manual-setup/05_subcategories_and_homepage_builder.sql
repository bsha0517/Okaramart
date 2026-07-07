-- Adds subcategory support and the admin-controlled homepage section builder.
-- Run this in Supabase SQL Editor once on your existing database.

alter table "Category" add column if not exists "parentId" text references "Category"(id);

create table if not exists "HomeSection" (
  id text primary key default gen_random_uuid()::text,
  type text not null,
  "refId" text,
  title text,
  "sortOrder" int not null default 0,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now()
);

-- Seed the default homepage layout to match what's live today —
-- delete/reorder/hide these from /admin/homepage once you're logged in.
insert into "HomeSection" (type, "sortOrder") values
  ('VALUE_PROPS', 1),
  ('CATEGORY_CAROUSEL', 2),
  ('BANNERS', 3),
  ('ALL_COLLECTIONS', 4),
  ('ALL_CATEGORY_ROWS', 5)
on conflict do nothing;
