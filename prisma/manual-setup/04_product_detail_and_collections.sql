-- Adds product-detail-page fields and homepage "Collection" carousel rows.
-- Run this in Supabase SQL Editor once on your existing database.

alter table "Product" add column if not exists "images" text[] not null default '{}';
alter table "Product" add column if not exists "brand" text;
alter table "Product" add column if not exists "attributes" jsonb;

create table if not exists "Collection" (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  slug text unique not null,
  "sortOrder" int not null default 0,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now()
);

create table if not exists "CollectionItem" (
  id text primary key default gen_random_uuid()::text,
  "collectionId" text not null references "Collection"(id),
  "productId" text not null references "Product"(id),
  "sortOrder" int not null default 0
);
