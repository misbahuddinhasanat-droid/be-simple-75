# Be Simple 75 — Developer Reference

## Project Overview

**Be Simple 75** is a dark streetwear e-commerce store for Bangladesh.
- Brand: **Be Simple**  |  Prices: **৳599** (sale) / ৳999 (crossed out)
- Stack: React + Vite (frontend) · Express (API) · PostgreSQL (DB)
- Admin password: `admin123`  |  Admin API key: `besimple2024`

---

## Quick Reference — Where to Edit What

### Brand Identity
| What to change | File |
|---|---|
| Store name / logo text | `artifacts/tshirt-studio/src/components/layout/Navbar.tsx` |
| Footer brand name + links | `artifacts/tshirt-studio/src/components/layout/Footer.tsx` |
| Admin panel brand name | `artifacts/tshirt-studio/src/components/admin/AdminLayout.tsx` |
| Admin login password | `artifacts/tshirt-studio/src/pages/admin/AdminLogin.tsx` — line 12 |
| Favicon | `artifacts/tshirt-studio/public/favicon.svg` |
| OG social share image | `artifacts/tshirt-studio/public/opengraph.jpg` |

### SEO & Meta Tags
| What to change | File |
|---|---|
| Page `<title>`, base OG tags, JSON-LD store data | `artifacts/tshirt-studio/index.html` |
| Site domain (for canonical URLs) | `artifacts/tshirt-studio/src/hooks/useSEO.ts` — `BASE_URL` constant |
| Per-page SEO (title, description) | Each page file — look for `useSEO({...})` call at top of component |
| Sitemap URLs | `artifacts/tshirt-studio/public/sitemap.xml` |
| Robots.txt rules | `artifacts/tshirt-studio/public/robots.txt` |

### Pricing & Products
| What to change | File |
|---|---|
| Sale price (৳599) | Edit directly from **Admin → Products** (click price to edit inline) |
| Strikethrough price (৳999) | Search `৳999` across `src/pages/` files |
| Product images | `artifacts/tshirt-studio/public/products/*.jpg` |
| Product names/categories | Edit from **Admin → Products** or run SQL query in DB |

### Colors & Styling
| What to change | File |
|---|---|
| Global CSS variables / fonts | `artifacts/tshirt-studio/src/index.css` |
| Storefront color scheme (black `#0a0a0a`, red `#e63329`) | `artifacts/tshirt-studio/src/index.css` |
| Admin color scheme (gold `#c9a227`) | `artifacts/tshirt-studio/src/components/admin/AdminLayout.tsx` |
| Tailwind config | `artifacts/tshirt-studio/tailwind.config.ts` (or `package.json` if inline) |

---

## Full File Structure

```
artifacts/tshirt-studio/          ← FRONTEND (React + Vite)
├── index.html                    ← SEO meta tags, OG, JSON-LD, geo tags — EDIT FOR SEO
├── public/
│   ├── favicon.svg               ← Site favicon
│   ├── opengraph.jpg             ← Facebook/WhatsApp share preview image
│   ├── robots.txt                ← Search engine crawl rules
│   ├── sitemap.xml               ← Sitemap for Google indexing
│   └── products/                 ← All product images (*.jpg)
│       └── [name]-front.jpg      ← Front view images
│       └── [name]-back.jpg       ← Back view images
│
└── src/
    ├── App.tsx                   ← Router — all page routes defined here
    ├── main.tsx                  ← React entry point
    ├── index.css                 ← Global styles, fonts, color variables
    │
    ├── hooks/
    │   ├── useSEO.ts             ← Per-page title/meta/OG/canonical tags ← EDIT DOMAIN HERE
    │   ├── useGTM.ts             ← Google Tag Manager + Meta Pixel injection
    │   ├── useBuyNow.ts          ← Buy Now flow (skip to checkout)
    │   └── use-toast.ts          ← Toast notifications
    │
    ├── pages/                    ← STOREFRONT PAGES (public-facing)
    │   ├── Home.tsx              ← Homepage — hero, featured products, filters
    │   ├── Products.tsx          ← All products listing with category filter
    │   ├── ProductDetail.tsx     ← Single product page — size, qty, add to cart
    │   ├── Cart.tsx              ← Shopping cart page
    │   ├── Checkout.tsx          ← Checkout form (name, address, phone for lead capture)
    │   ├── OrderConfirmation.tsx ← Success page after order placed
    │   ├── Customize.tsx         ← Custom design upload page
    │   ├── DesignTemplates.tsx   ← Design template browser
    │   └── not-found.tsx         ← 404 page
    │
    ├── pages/admin/              ← ADMIN PANEL (protected by AdminGuard)
    │   ├── AdminLogin.tsx        ← Login page — password is "admin123" (change line 12)
    │   ├── AdminDashboard.tsx    ← Stats overview — revenue, orders, leads
    │   ├── AdminOrders.tsx       ← Order management — status updates, expandable rows
    │   ├── AdminLeads.tsx        ← Incomplete orders — phone fraud check, call notes
    │   ├── AdminProducts.tsx     ← Product price/stock editing — click to edit inline
    │   └── AdminSettings.tsx     ← API keys — GTM, Pixel, BD Courier, Pathao, Steadfast, Uddokta Pay
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.tsx        ← Wraps all public pages with Navbar + Footer
    │   │   ├── Navbar.tsx        ← Top navigation bar — logo, cart count, links
    │   │   └── Footer.tsx        ← Footer — brand name, links, copyright
    │   ├── admin/
    │   │   ├── AdminLayout.tsx   ← Admin sidebar + topbar shell (colors/nav items here)
    │   │   └── AdminGuard.tsx    ← Redirects to /admin/login if not authenticated
    │   ├── QuickBuyModal.tsx     ← Size selector popup for quick purchase
    │   └── ui/                   ← Shadcn/UI components (don't edit unless needed)
    │
    └── lib/
        └── utils.ts              ← Tailwind class merge utility

artifacts/api-server/             ← BACKEND (Express + Drizzle ORM)
└── src/
    ├── app.ts                    ← Express app setup, middleware, route mounting
    ├── index.ts                  ← Server entry point (PORT binding)
    ├── lib/
    │   └── logger.ts             ← Pino logger (use req.log in routes)
    ├── middlewares/              ← Add custom Express middleware here
    └── routes/
        ├── index.ts              ← Mounts all route files on the Express app
        ├── admin.ts              ← ALL ADMIN API ROUTES (orders, products, leads, settings, fraud check)
        ├── products.ts           ← Public product listing + detail
        ├── cart.ts               ← Cart session (get, add, remove, update)
        ├── orders.ts             ← Public order creation
        ├── leads.ts              ← Public lead capture (POST /api/leads)
        ├── upload.ts             ← Design image upload
        └── health.ts             ← Health check endpoint

lib/db/                           ← DATABASE SCHEMA + MIGRATIONS
└── src/
    ├── index.ts                  ← Exports db client + all tables
    └── schema/
        ├── index.ts              ← Re-exports all schemas
        ├── products.ts           ← Products table schema
        ├── orders.ts             ← Orders table schema
        ├── leads.ts              ← Leads/incomplete orders table
        ├── settings.ts           ← Key-value store (API keys, GTM ID, etc.)
        └── uploads.ts            ← Design upload records

lib/api-spec/
└── openapi.yaml                  ← OpenAPI spec — edit to add new API endpoints

lib/api-client-react/             ← Auto-generated React Query hooks (don't edit)
lib/api-zod/                      ← Auto-generated Zod validation schemas (don't edit)
```

---

## Admin Panel Routes

| URL | Page | Description |
|---|---|---|
| `/admin/login` | AdminLogin | Enter password `admin123` |
| `/admin` | AdminDashboard | Revenue, orders, leads stats |
| `/admin/orders` | AdminOrders | View/update order status |
| `/admin/leads` | AdminLeads | Incomplete checkouts + fraud check |
| `/admin/products` | AdminProducts | Edit price, stock, featured |
| `/admin/settings` | AdminSettings | GTM, Pixel, API keys |

## Storefront Routes

| URL | Page | Description |
|---|---|---|
| `/` | Home | Hero + featured products |
| `/products` | Products | All products + category filter |
| `/product/:id` | ProductDetail | Single product + add to cart |
| `/cart` | Cart | Cart summary |
| `/checkout` | Checkout | Checkout form (captures lead by phone) |
| `/order-confirmation/:id` | OrderConfirmation | Order success page |
| `/customize` | Customize | Custom design upload |
| `/design-templates` | DesignTemplates | Pre-made design templates |

---

## Key API Endpoints

| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Public | List all products |
| GET | `/api/products/featured` | Public | Featured products only |
| GET | `/api/products/:id` | Public | Single product detail |
| GET | `/api/cart` | Public | Get cart (session-based) |
| POST | `/api/cart` | Public | Add item to cart |
| POST | `/api/orders` | Public | Place an order |
| POST | `/api/leads` | Public | Save incomplete checkout lead |
| GET | `/api/settings` | Public | GTM ID + Pixel ID (tracking only) |
| GET | `/api/admin/stats` | Admin key | Dashboard stats |
| GET | `/api/admin/orders` | Admin key | List orders |
| PATCH | `/api/admin/orders/:id` | Admin key | Update order status |
| GET | `/api/admin/products` | Admin key | List products |
| PATCH | `/api/admin/products/:id` | Admin key | Edit price/stock/featured |
| GET | `/api/admin/leads` | Admin key | List incomplete orders |
| PATCH | `/api/admin/leads/:id` | Admin key | Update lead status/notes |
| GET | `/api/admin/fraud-check?phone=` | Admin key | BD Courier fraud grade |
| GET | `/api/admin/settings` | Admin key | All API keys + tracking IDs |
| PATCH | `/api/admin/settings` | Admin key | Save any setting key |

---

## Settings Keys (Database)

These are stored in the `settings` table and edited via **Admin → Settings**:

| Key | What it controls |
|---|---|
| `gtm_id` | Google Tag Manager container ID (e.g. GTM-XXXXXXX) |
| `pixel_id` | Meta/Facebook Pixel ID |
| `bdcourier_api_key` | BD Courier API — enables fraud check on Leads page |
| `pathao_client_id` | Pathao parcel delivery client ID |
| `pathao_client_secret` | Pathao parcel delivery client secret |
| `steadfast_api_key` | Steadfast parcel delivery API key |
| `steadfast_secret_key` | Steadfast parcel delivery secret key |
| `uddoktapay_api_key` | Uddokta Pay merchant API key |
| `uddoktapay_api_secret` | Uddokta Pay API secret |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | Wouter |
| State / Data | TanStack React Query |
| Backend | Express 5 + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod |
| Logger | Pino |
| Package manager | pnpm (workspace monorepo) |

---

## Common Tasks

**Change the brand name everywhere:**
1. `src/components/layout/Navbar.tsx` — logo text
2. `src/components/layout/Footer.tsx` — footer brand
3. `src/components/admin/AdminLayout.tsx` — admin sidebar
4. `index.html` — `<title>`, OG tags, JSON-LD `name` field
5. `src/hooks/useSEO.ts` — `BASE_TITLE` and `BASE_DESC` constants

**Change admin password:**
`src/pages/admin/AdminLogin.tsx` — change `"admin123"` on line 12

**Add a new product:**
Use Admin → Products page or insert directly into DB

**Add a new page:**
1. Create file in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add to sitemap `public/sitemap.xml`

**Add a new API route:**
1. Add to appropriate file in `artifacts/api-server/src/routes/`
2. Mount it in `artifacts/api-server/src/routes/index.ts`
3. Update `lib/api-spec/openapi.yaml` if you want typed hooks

**Push DB schema changes:**
```bash
pnpm --filter @workspace/db run push
```
