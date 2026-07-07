-- Allows customers to sign up via Google/Facebook, which don't provide a
-- phone number — only email. Run this in Supabase SQL Editor once.

alter table "User" alter column "phone" drop not null;
