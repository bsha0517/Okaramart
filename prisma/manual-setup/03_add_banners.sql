-- Adds the Banner table for admin-managed homepage promo banners.
-- Run this in Supabase SQL Editor — safe to run once on your existing database.

create table if not exists "Banner" (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  subtitle text,
  "imageUrl" text,
  "linkUrl" text,
  "bgColor" text not null default '#0F3D3E',
  "sortOrder" int not null default 0,
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now()
);
