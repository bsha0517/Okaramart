-- Okara Mart — full schema creation
-- Run this once in Supabase SQL Editor

create extension if not exists pgcrypto;

-- ---------- ENUMS ----------
create type "Role" as enum ('SUPER_ADMIN', 'MANAGER', 'PACKER', 'RIDER', 'CUSTOMER');
create type "OrderStatus" as enum ('PLACED','CONFIRMED','PACKING','PACKED','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','RETURNED');
create type "PaymentMethod" as enum ('JAZZCASH','EASYPAISA','COD');
create type "PaymentStatus" as enum ('PENDING','PAID','FAILED','REFUNDED');

-- ---------- USERS ----------
create table "User" (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  phone text unique not null,
  email text unique,
  "passwordHash" text,
  role "Role" not null default 'CUSTOMER',
  "isActive" boolean not null default true,
  "createdAt" timestamptz not null default now()
);

create table "OtpCode" (
  id text primary key default gen_random_uuid()::text,
  phone text not null,
  code text not null,
  purpose text not null,
  "expiresAt" timestamptz not null,
  "consumedAt" timestamptz,
  attempts int not null default 0,
  "createdAt" timestamptz not null default now()
);
create index "OtpCode_phone_purpose_idx" on "OtpCode" (phone, purpose);

create table "Address" (
  id text primary key default gen_random_uuid()::text,
  "userId" text not null references "User"(id),
  label text not null,
  "addressLine" text not null,
  area text not null,
  lat float,
  lng float,
  "isDefault" boolean not null default false,
  "createdAt" timestamptz not null default now()
);

-- ---------- CATALOG ----------
create table "Category" (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  "imageUrl" text
);

create table "Product" (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  description text,
  "imageUrl" text,
  price decimal(10,2) not null,
  "compareAtPrice" decimal(10,2),
  unit text not null,
  sku text unique not null,
  "stockQty" int not null default 0,
  "lowStockAlertAt" int not null default 5,
  "isActive" boolean not null default true,
  "categoryId" text not null references "Category"(id),
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table "Review" (
  id text primary key default gen_random_uuid()::text,
  "productId" text not null references "Product"(id),
  "userId" text not null references "User"(id),
  rating int not null,
  comment text,
  "createdAt" timestamptz not null default now()
);

-- ---------- ORDERS ----------
create table "Order" (
  id text primary key default gen_random_uuid()::text,
  "orderNumber" text unique not null,
  "customerId" text not null references "User"(id),
  "addressId" text not null,
  "addressSnapshot" text not null,
  "riderId" text references "User"(id),
  status "OrderStatus" not null default 'PLACED',
  "paymentMethod" "PaymentMethod" not null,
  "paymentStatus" "PaymentStatus" not null default 'PENDING',
  subtotal decimal(10,2) not null,
  "deliveryFee" decimal(10,2) not null default 0,
  discount decimal(10,2) not null default 0,
  total decimal(10,2) not null,
  "couponCode" text,
  "deliverySlot" text,
  "otpCode" text,
  notes text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table "OrderItem" (
  id text primary key default gen_random_uuid()::text,
  "orderId" text not null references "Order"(id),
  "productId" text not null references "Product"(id),
  quantity int not null,
  "unitPrice" decimal(10,2) not null
);

create table "OrderStatusLog" (
  id text primary key default gen_random_uuid()::text,
  "orderId" text not null references "Order"(id),
  status "OrderStatus" not null,
  note text,
  "createdAt" timestamptz not null default now()
);

-- ---------- PAYMENTS ----------
create table "Payment" (
  id text primary key default gen_random_uuid()::text,
  "orderId" text unique not null references "Order"(id),
  method "PaymentMethod" not null,
  status "PaymentStatus" not null default 'PENDING',
  "providerTxnId" text,
  "providerRawResponse" jsonb,
  amount decimal(10,2) not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- ---------- MARKETING ----------
create table "Coupon" (
  id text primary key default gen_random_uuid()::text,
  code text unique not null,
  description text,
  "discountType" text not null,
  "discountValue" decimal(10,2) not null,
  "minOrderValue" decimal(10,2) not null default 0,
  "maxUses" int,
  "usedCount" int not null default 0,
  "expiresAt" timestamptz,
  "isActive" boolean not null default true
);

-- ---------- DELIVERY ZONES ----------
create table "DeliveryZone" (
  id text primary key default gen_random_uuid()::text,
  "areaName" text unique not null,
  "deliveryFee" decimal(10,2) not null,
  "etaMinutes" int not null default 30,
  "isActive" boolean not null default true
);
