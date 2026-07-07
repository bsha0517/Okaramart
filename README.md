# Okara Mart — Dark Store Web App

A single-city grocery dark-store platform for Okara: customer storefront,
role-based admin panel, and JazzCash / EasyPaisa / Cash-on-Delivery checkout.

## What's included

- **Storefront**: catalog, categories, cart, checkout (`app/`)
- **Customer accounts**: phone + OTP signup/login (`app/signup`,
  `app/api/auth/otp/*`) — no passwords for customers, just an SMS code.
  Email is optionally collected at signup.
- **Map location picker** (`components/GoogleMapLocationPicker.tsx`):
  customers can search an address, drop a pin, or use their current
  location at checkout, using Google Maps + Places Autocomplete. Requires
  a `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (see below) — Google's free tier
  ($200/month credit) comfortably covers a single-city store.
- **Admin panel** (`app/admin`): dashboard, order management, and full
  inventory management (add/edit/remove products) — gated by role via
  `middleware.ts`
- **Roles**: SUPER_ADMIN, MANAGER, PACKER, RIDER, CUSTOMER (`prisma/schema.prisma`)
- **Payments** (`lib/payments/`): JazzCash and EasyPaisa hosted-checkout
  redirect flow + signature verification, and Cash on Delivery with an
  OTP confirmation step at handoff
- **Database schema**: products, orders, delivery zones (per Okara
  neighborhood), coupons, reviews, order status history, OTP codes

- **Full quick-commerce homepage**: delivery-time badge, value-prop
  strip, scrollable category carousel, admin-managed promo banners, and
  per-category horizontal product rows with "See All" — matching the
  Zepto/Blinkit-style layout
- **Admin-managed banners** (`/admin/banners`): add/reorder/hide
  homepage promo banners without touching code — requires running
  `prisma/manual-setup/03_add_banners.sql` once in Supabase (new
  database, skip straight to step 3 below; existing database, just run
  this one file)
- **Working search** in the header — searches product names, results
  show on the homepage at `/?q=...`

## What you still need to do before going live

**New in this round — run `prisma/manual-setup/04_product_detail_and_collections.sql`
in Supabase once** (adds product gallery/brand/highlights fields and the
Collection tables):

- **Product detail pages** (`/product/[slug]`) — image gallery, brand,
  price with discount %, admin-editable "Highlights" table, description,
  and disclaimer/support info, matching the Zepto PDP layout
- **Category management** (`/admin/categories`) — add/delete categories
  with an icon image, without touching code
- **Homepage carousel rows** (`/admin/collections`) — curated rows like
  "Trending Now" separate from the automatic per-category rows; search
  and add any product to a row from the admin UI
- **Delivery location picker in the header** — signed-in customers see
  their saved area; guests get a map picker that stashes the pick and
  prompts login/signup, then auto-saves it as their address once they
  authenticate


1. **Get real payment credentials.** Apply for JazzCash and EasyPaisa
   merchant accounts (business bank account + NTN required in Pakistan).
   Drop the credentials into `.env`. The integration code matches their
   hosted-checkout hash/signature scheme, but is untested against live
   sandbox until you have credentials — budget time for sandbox testing
   with their integration team.
2. **Connect a real SMS gateway.** Customer OTP login currently logs
   codes to the server console (`SMS_PROVIDER=console` in `.env`) so you
   can test the flow without paying for SMS. Before launch, implement a
   real provider in `lib/sms.ts` — a Pakistani bulk SMS API or your
   telecom's business SMS portal is the usual route.
3. **Connect a real database** — any hosted Postgres works (Supabase,
   Neon, Railway). Run:
   ```bash
   npm install
   npx prisma db push
   npm run db:seed
   ```
4. **Add product photos and real inventory** via `/admin/inventory` —
   the add/edit form is built; just needs real product data and image
   URLs (or wire up a file upload to S3/Cloudinary if you want to upload
   images directly instead of pasting URLs).
5. **Get a Google Maps API key** for the checkout location picker:
   - Go to [Google Cloud Console](https://console.cloud.google.com/) →
     create a project (or use an existing one)
   - APIs & Services → Library → enable **Maps JavaScript API** and
     **Places API**
   - APIs & Services → Credentials → Create API key
   - Restrict the key to **HTTP referrers** and add your domain
     (e.g. `https://yourdomain.com/*`) before going live, so it can't be
     used from other sites
   - Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel's environment
     variables to that key
   - You'll need a billing account on the Google Cloud project (Google
     requires this even within the free tier), but the $200/month free
     credit comfortably covers map loads for a single-city store
5. **Delivery zones** — `prisma/seed.ts` has starter Okara neighborhoods
   with placeholder fees. Adjust to your real coverage area and rider
   capacity.

## Deployment gotchas (learned the hard way)

- **Use Supabase's pooler connection string**, not the direct one. Vercel's
  build servers often can't reach `db.xxx.supabase.co:5432` directly.
  In Supabase → Project Settings → Database → Connection string → pick
  **Connection pooling**, port `6543`. That's your `DATABASE_URL`.
- Pages that query the database (`app/page.tsx`, everything under
  `app/admin/`) are marked `export const dynamic = "force-dynamic"` so
  Next.js fetches data per-request instead of trying to query the
  database *during the build itself* (which fails since the build
  environment can't always reach your DB, and doesn't need to).
- After changing environment variables in Vercel, you must **redeploy** —
  Vercel doesn't retroactively apply env var changes to a build that
  already ran.



```bash
npm install
cp .env.example .env   # fill in DATABASE_URL at minimum to start
npx prisma db push
npm run db:seed
npm run dev
```

Default seeded admin login: `03000000000` / `ChangeMe123!` — change this
immediately.

## Deployment

- **Recommended**: Vercel (for the Next.js app) + Supabase or Neon (Postgres).
- Set all `.env.example` variables in your host's environment settings.
- JazzCash/EasyPaisa require your **return/callback URLs** to be publicly
  reachable HTTPS URLs — update `JAZZCASH_RETURN_URL` / `EASYPAISA_RETURN_URL`
  to your production domain before switching `*_ENV` to `production`.

## Suggested next build phases

All of the following are now implemented:

1. ✅ Bulk CSV import for inventory (`/admin/inventory/import`)
2. ✅ Rider mobile view (`/rider`, restricted to RIDER role)
3. ✅ SMS notifications on order status change (via `lib/sms.ts`)
4. ✅ Coupon management UI (`/admin/coupons`)
5. ✅ WhatsApp support button (floating, site-wide — update the phone
   number in `components/WhatsAppButton.tsx`)
6. ✅ Basic analytics (`/admin/analytics`) — best sellers, peak order
   hours, repeat customer rate
7. ✅ Image upload scaffold (`lib/uploads.ts`, `/api/uploads`) — needs a
   real storage provider wired in before it works (currently throws a
   clear error telling the admin to paste a URL instead)

Also added: `/login`, `/account` (order history + saved addresses),
`/contact`, `/about`, and header/footer navigation linking all of them.

### More ideas worth considering next

- **Loyalty points or a referral program** — give credit for referring
  friends, since word-of-mouth matters a lot for a single-city store
- **Scheduled delivery slots** — not just ASAP, let customers pick a
  2-hour window (useful once you have delivery volume)
- **Push notifications via a PWA** — turn the site into an installable
  app with the Web Push API so you don't rely solely on SMS
- **Order editing window** — let customers add/remove items for a few
  minutes after placing an order, before packing starts
- **Rider live location sharing** — show the customer roughly where
  their rider is (needs the rider app to report location periodically)
- **Inventory forecasting** — flag products that are trending toward
  stockout based on recent sales velocity, not just a static threshold
- **Multi-warehouse support** — if you ever expand beyond one dark
  store within Okara, the delivery-zone model in the schema can extend
  to route orders to the nearest warehouse
- **Customer support ticket log** — even a simple table logging
  WhatsApp/phone complaints, so patterns (late deliveries, wrong items)
  are visible to management
- **Refund workflow** — a formal path for RETURNED orders that
  calculates and (eventually) triggers a refund via JazzCash/EasyPaisa
  refund APIs or store credit
- **A/B testing delivery fees or minimum order values** — once you
  have real traffic, testing whether a lower delivery fee increases
  order frequency enough to offset it


