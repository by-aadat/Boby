# KartME — Phase 1 Frontend (Working Build)

This is the real, working KartME e-commerce frontend — Next.js + TypeScript + Tailwind,
running on realistic mock data (51 products across Men/Women/Kids/Accessories).
This matches the "Phase 1" scope from the KartME build roadmap: full UI, no backend yet.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build for production

```bash
npm run build
npm run start
```

## What's included

- Homepage: hero carousel, category tiles, flash sale w/ live countdown, best sellers,
  new arrivals, promo banner, brand strip, reviews, newsletter
- Product listing (`/products`, `/category/[slug]`, `/search`) with working filters
  (brand, price, size, colour, material, rating), sort, and URL-synced state
- Product detail page: gallery, colour/size variant selection, stock states,
  PIN code delivery check, tabs (description/specs/size guide/delivery/reviews)
- Cart with coupon codes (`KARTME200`, `WELCOME10` are wired for testing), free-shipping nudge
- **Full guest checkout**: Information → Address → Summary → Payment → Order Confirmation,
  with a visual order timeline and order history at `/account/orders`
- **Real customer accounts**: register, login, logout, sessions (httpOnly signed cookies),
  password hashing (PBKDF2, 10,000 iterations, per-user salt), rate-limited login,
  protected `/account/*` routes, editable profile, full address CRUD
- **Full admin panel** at `/admin`: separate login/session from customers, role-based
  permissions (Super Admin/Admin/Manager/Staff), dashboard with live KPIs, product
  management (add/edit/delete), order management with status updates, customer
  management (view/disable), **coupon management**, **banner management**, **review
  moderation**, and website settings — all enforced server-side, not just hidden in the UI
- **Real coupon validation** at checkout (min order, expiry, usage limits, percentage
  or fixed discount, all checked server-side) — `KARTME200` and `WELCOME10` work as
  demo codes in mock mode
- **SEO**: dynamic `sitemap.xml` and `robots.txt`, JSON-LD Product structured data on
  every product page, per-product meta title/description/Open Graph tags
- Wishlist, Login, Register (forms validated with Zod, ready to wire to a real backend)
- Static pages: About, Contact, FAQ, Privacy, Terms, Returns, Shipping
- Mobile-first responsive design, skeleton loaders, empty states, 404 page
- Brand colours pulled from the KartME logo: blue `#154897`, orange `#EE7117`
- **Real Google Apps Script + Google Sheets backend** (in `apps-script/`) with
  stock-safe, lock-protected order creation — see "Connecting the real Google
  Sheets backend" below

## Architecture note

All data flows through `repositories/productRepo.ts` → `adapters/mockAdapter.ts` → `mock/*.json`.
No component imports mock data directly. This means Phase 2 (wiring to Google Sheets +
Apps Script) only requires writing a new `adapters/sheetsAdapter.ts` — no component changes.

## Restoring Google Fonts

This build was compiled in a sandboxed environment without access to fonts.googleapis.com,
so it currently ships with a system-font fallback (defined in `app/globals.css`). To restore
the real Poppins/Inter web fonts once you have normal internet access:

1. In `app/layout.tsx`, add back:
   ```ts
   import { Poppins, Inter } from "next/font/google";
   const poppins = Poppins({ subsets: ["latin"], weight: ["500","600","700"], variable: "--font-poppins" });
   const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
   ```
   and add `${poppins.variable} ${inter.variable}` back to the `<body>` className.
2. In `app/globals.css`, change:
   ```css
   --font-heading: var(--font-poppins);
   --font-body: var(--font-inter);
   ```

## Regenerating mock data

```bash
node scripts/gen-mock.mjs
```

## Checkout in mock mode vs real backend

With `NEXT_PUBLIC_BACKEND_ENABLED=false` (default), placing an order stores it in
your browser's localStorage so the confirmation/order-history pages have real
data to show — but no actual stock is checked or decremented, since there's no
real database yet. This is fine for demos, but **not for production**.

Once you connect the real Google Sheets backend (`NEXT_PUBLIC_BACKEND_ENABLED=true`),
every order goes through `apps-script/Orders.gs`, which:
- Re-checks current stock straight from the sheet (never trusts the browser)
- Uses `LockService` so two customers can't both buy the last unit
- Writes to Orders, OrderItems, Payments and Inventory sheets atomically
- Rejects the order with a clear message if stock ran out in the meantime

## Customer accounts in mock mode vs real backend

With `NEXT_PUBLIC_BACKEND_ENABLED=false` (default), registration/login work using a
tiny in-memory user store (`lib/mockAuthStore.ts`) so you can test the full auth
flow locally with zero setup. This store lives only in server memory for the life
of the running process — it resets when you restart `npm run dev`, and it won't
work correctly across multiple serverless instances in a real deployment. It exists
purely so you can click through registration → login → protected pages in a demo.

Once you connect the real Google Sheets backend, every auth action goes through
`apps-script/Auth.gs` and `apps-script/Customers.gs`, which:
- Hash passwords with PBKDF2 (10,000 iterations) and a per-user salt — never
  stores or logs plain-text passwords
- Issue signed session tokens (HMAC-SHA256) as httpOnly cookies — the browser
  never touches the raw token
- Rate-limit failed logins (5 attempts → 15 minute lockout, configurable in Settings)
- Give an identical error for "wrong password" and "mobile not registered", so an
  attacker can't enumerate registered accounts

Address management and profile editing (`/account/addresses`, `/account/profile`)
require the real backend — they'll show a "connect the backend" message in mock
mode, since a proper address book needs real persistence.

## SEO notes

Set `NEXT_PUBLIC_SITE_URL` in your environment (e.g. `https://kartme.in`) once you
have a real domain, so `sitemap.xml` and Open Graph tags point at the right URLs
instead of the placeholder `https://kartme.example.com`.

## What's still on the roadmap (v2)

Nearly everything from the original 60-section spec is now built, including
Razorpay payments and a homepage section builder. What's left needs
infrastructure only you can provide:

- OTP login, Google/Facebook login — needs a Firebase project or Google Cloud
  OAuth client (your own credentials)
- WizApp ERP sync — needs a decision from you on integration tier (see the
  original roadmap document, §7); `bulkImportProducts` (admin action) is ready
  to be the landing point for a CSV export from WizApp

Coupons, banners, reviews, returns, reports, product variants, bulk import,
online payments (Razorpay), and the homepage builder are all built and working.

## Online payments (Razorpay)

Checkout supports Cash on Delivery, UPI (recorded manually), and Card/Net
Banking/UPI via Razorpay. Razorpay is **optional** — leave `RAZORPAY_KEY_ID`
and `RAZORPAY_KEY_SECRET` blank and the online option will show a clear
"not configured" message, steering customers to COD/UPI instead. Nothing
else breaks.

To enable it: create a Razorpay account, grab your Key ID and Key Secret from
Settings → API Keys, and add them to your environment (`.env.local` locally,
or your Vercel project's Environment Variables).

**Security note:** payment status is never trusted from the browser. When a
Razorpay payment completes, the checkout page sends the payment signature to
`/api/orders/create`, which independently re-verifies that signature
server-side (using your secret key) before ever telling the backend an order
is "paid". The generic `/api/store` proxy explicitly refuses to create orders
at all — order creation only happens through this one verified path.

## Homepage section builder

`/admin/settings` has a Homepage Sections panel — toggle any section on/off
and reorder them with the up/down arrows. This is stored as a JSON list in the
`Settings` sheet and read by the homepage on every request, so changes apply
without a redeploy (subject to the usual cache TTL).

## Admin panel

The admin panel at `/admin` only works with the real Google Sheets backend
connected — there's no mock-mode fallback for it, since managing real
inventory/orders/customers against fake data isn't useful.

To create your first admin login: open your Google Sheet, run
**KartME → 4. Create First Admin User** from the menu, and follow the prompts.
Then go to `/admin/login` on your site.

Admin sessions are cryptographically separate from customer sessions — different
signing secret, different cookie, different token shape — so a customer session
can never be forged into admin access. Every admin action re-checks the admin's
role server-side in `apps-script/AdminAuth.gs` and `apps-script/Admin.gs`, not
just in the UI, so a Staff-role account can't call Settings-only actions even by
hitting the API directly.

## Connecting the real Google Sheets backend

By default this site runs on realistic mock data — zero setup needed. When you're
ready to connect a real Google Sheets database, follow the step-by-step guide in
`apps-script/README_APPSCRIPT.md`. It walks you through:

1. Creating the `KartME_Database` Google Sheet
2. Pasting in the Apps Script backend (all files in `apps-script/`)
3. One-click database setup + demo data import (via a custom spreadsheet menu)
4. Deploying the Apps Script as a Web App
5. Adding the URL + secret to your `.env.local`

Once `NEXT_PUBLIC_BACKEND_ENABLED=true` is set with valid credentials, every page
automatically switches from mock data to your live Google Sheet — no component
code changes needed, because everything goes through `repositories/productRepo.ts`.

## Deploying via GitHub + Vercel

1. Push this project to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "KartME website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/kartme.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, click **Add New → Project**,
   and import the `kartme` repository.
3. Before deploying, expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_BACKEND_ENABLED` | `true` |
   | `APPS_SCRIPT_URL` | your Apps Script Web App URL |
   | `API_SHARED_SECRET` | your shared secret |
4. Click **Deploy**. Vercel builds and gives you a live `https://kartme-xxxx.vercel.app` URL.
5. Once you're happy, add your own domain under Project Settings → Domains.

Every time you push to `main` on GitHub, Vercel automatically redeploys — that's
your whole "GitHub se link karke live karna" workflow.


## Next steps

See the accompanying roadmap and phase prompts:
- `KartME_Website_Roadmap.md` — full 7-phase plan
- `KartME_Phase2_Build_Prompt.md` — connect to Google Sheets + Apps Script
- `KartME_Phase3_Build_Prompt.md` — customer accounts, login, sessions
