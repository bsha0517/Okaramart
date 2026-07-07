-- Adds small-order fee and platform fee columns to orders.
-- Run this in Supabase SQL Editor once.

alter table "Order" add column if not exists "smallOrderFee" decimal(10,2) not null default 0;
alter table "Order" add column if not exists "platformFee" decimal(10,2) not null default 0;
