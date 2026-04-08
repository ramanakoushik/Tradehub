# Trade-Hub — Claude Code Project Spec


---

## Project overview

Trade-Hub is a peer-to-peer trading and rental platform for college students. Students list items for trade (exchange/cash) or rent (time-limited, deposit-backed). All users must be verified via college email. The platform is scoped to a single campus per user session.

**Primary users:** Hostel/college students in India  
**Core actions:** List → Discover → Offer/Book → QR Handoff → Rate  
**Primary market:** India — mobile-first, UPI payments via Razorpay

---

## Absolute rules (must follow, no exceptions)

- NEVER store secrets or API keys in source files. Use `.env` and `process.env` only.
- NEVER write raw SQL. Use Prisma ORM for all database access.
- NEVER use `any` type in TypeScript. All types must be explicit.
- NEVER commit directly to `main`. All changes go through feature branches.
- NEVER skip Zod validation on any API input. Every request body and query param must be validated.
- NEVER use unicode bullet characters (`•`) in JSX or template strings. Use proper list elements.
- ALWAYS run `pnpm lint && pnpm typecheck` before considering a task complete.
- ALWAYS write tests for every API route and every utility function.
- ALWAYS use `ShadingType.CLEAR` (not SOLID) in any docx generation code.
- ALWAYS handle errors explicitly — no silent catches. Log with context.

---

## Tech stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Next.js | 14 (App Router) |
| Styling | Tailwind CSS | 3.x |
| State | Zustand | latest |
| Backend | NestJS | 10.x |
| ORM | Prisma | 5.x |
| Database | PostgreSQL | 15 |
| Cache / RT | Redis | 7 |
| Real-time | Socket.io | 4.x |
| Auth | Clerk | latest |
| Payments | Razorpay | latest SDK |
| Storage | Cloudinary | latest SDK |
| Push | Firebase FCM | latest |
| Email | Nodemailer + Resend | latest |
| Validation | Zod | 3.x |
| Testing | Vitest + Supertest | latest |
| Deploy FE | Vercel | — |
| Deploy BE | Railway | — |

---

## Repository structure

```
tradehub/
├── apps/
│   ├── web/                  # Next.js 14 frontend
│   │   ├── app/              # App Router pages
│   │   ├── components/       # Shared UI components
│   │   ├── lib/              # Client utilities, API wrappers
│   │   ├── store/            # Zustand stores
│   │   └── public/           # Static assets, PWA manifest
│   └── api/                  # NestJS backend
│       ├── src/
│       │   ├── auth/         # Clerk webhook, JWT guard
│       │   ├── listings/     # Listing CRUD, search, expiry cron
│       │   ├── trades/       # Offer flow, state machine, QR handoff
│       │   ├── rentals/      # Booking, deposit escrow, timers
│       │   ├── messages/     # Socket.io chat
│       │   ├── requests/     # Wish list / want requests
│       │   ├── referrals/    # Referral codes, rewards
│       │   ├── notifications/# Push, in-app, email dispatch
│       │   ├── users/        # Profile, trust score
│       │   ├── admin/        # Moderation, disputes
│       │   └── prisma/       # Prisma service
│       └── test/
├── packages/
│   ├── types/                # Shared TypeScript types (DTOs, enums)
│   ├── utils/                # Shared pure utilities
│   └── zod-schemas/          # Shared Zod schemas used by both apps
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env.example
└── CLAUDE.md                 # This file
```

---

## Database schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model College {
  id              String   @id @default(cuid())
  name            String
  city            String
  emailDomains    String[] // e.g. ["iith.ac.in", "iith.edu"]
  users           User[]
  createdAt       DateTime @default(now())
}

model User {
  id              String   @id @default(cuid())
  clerkId         String   @unique
  email           String   @unique
  username        String   @unique
  displayName     String
  avatarUrl       String?
  collegeId       String
  college         College  @relation(fields: [collegeId], references: [id])
  hostel          String?
  block           String?
  trustScore      Float    @default(0)
  completedTrades Int      @default(0)
  referralCode    String   @unique @default(cuid())
  listings        Listing[]
  tradesSent      TradeRequest[] @relation("buyer")
  tradesReceived  TradeRequest[] @relation("seller")
  rentals         Rental[]
  wantRequests    WantRequest[]
  reviewsGiven    Review[] @relation("reviewer")
  reviewsReceived Review[] @relation("reviewee")
  referralsMade   Referral[] @relation("referrer")
  referralsReceived Referral[] @relation("referred")
  createdAt       DateTime @default(now())
}

enum ListingType {
  TRADE
  RENT
}

enum ListingStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
  ARCHIVED
  DONATED
}

enum ItemCondition {
  NEW
  LIKE_NEW
  GOOD
  FAIR
  POOR
}

model Listing {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  title           String        @db.VarChar(80)
  description     String        @db.VarChar(500)
  type            ListingType
  category        String
  condition       ItemCondition
  price           Int           // in paise (smallest INR unit)
  depositAmount   Int?          // for rentals, in paise
  dailyRate       Int?          // for rentals, in paise per day
  minRentalDays   Int?
  maxRentalDays   Int?
  status          ListingStatus @default(OPEN)
  featured        Boolean       @default(false)
  photos          ListingPhoto[]
  categoryFields  ListingField[]
  tradeRequests   TradeRequest[]
  rentals         Rental[]
  blackoutDates   DateTime[]    // for rental availability
  expiresAt       DateTime?     // set by expiry cron
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model ListingPhoto {
  id            String   @id @default(cuid())
  listingId     String
  listing       Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  cloudinaryUrl String
  order         Int
}

model ListingField {
  id        String  @id @default(cuid())
  listingId String
  listing   Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)
  fieldKey  String
  fieldValue String
  @@unique([listingId, fieldKey])
}

enum TradeStatus {
  OPEN
  OFFER_MADE
  OFFER_ACCEPTED
  HANDOFF_PENDING
  COMPLETED
  DISPUTED
  CANCELLED
}

model TradeRequest {
  id            String      @id @default(cuid())
  listingId     String
  listing       Listing     @relation(fields: [listingId], references: [id])
  buyerId       String
  buyer         User        @relation("buyer", fields: [buyerId], references: [id])
  sellerId      String
  seller        User        @relation("seller", fields: [sellerId], references: [id])
  offerAmount   Int?        // in paise
  offerNote     String?
  status        TradeStatus @default(OFFER_MADE)
  messages      Message[]
  qrHandoff     QrHandoff?
  review        Review?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}

model QrHandoff {
  id              String       @id @default(cuid())
  tradeRequestId  String       @unique
  tradeRequest    TradeRequest @relation(fields: [tradeRequestId], references: [id])
  buyerToken      String       @unique @default(cuid())
  sellerToken     String       @unique @default(cuid())
  buyerScannedAt  DateTime?
  sellerScannedAt DateTime?
  expiresAt       DateTime
  createdAt       DateTime     @default(now())
}

enum RentalStatus {
  PENDING_PAYMENT
  ACTIVE
  OVERDUE
  RETURN_PENDING
  COMPLETED
  DISPUTED
  CANCELLED
}

model Rental {
  id                  String       @id @default(cuid())
  listingId           String
  listing             Listing      @relation(fields: [listingId], references: [id])
  renterId            String
  renter              User         @relation(fields: [renterId], references: [id])
  startDate           DateTime
  endDate             DateTime
  totalCost           Int          // in rupees
  depositAmount       Int          // in rupees
  status              RentalStatus @default(PENDING_PAYMENT)
  razorpayPaymentId   String?
  razorpayOrderId     String?
  pickupHandoffAt     DateTime?
  returnHandoffAt     DateTime?
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
}

model Message {
  id              String       @id @default(cuid())
  tradeRequestId  String
  tradeRequest    TradeRequest @relation(fields: [tradeRequestId], references: [id])
  senderId        String
  body            String
  attachmentUrl   String?
  createdAt       DateTime     @default(now())
}

model Review {
  id              String       @id @default(cuid())
  reviewerId      String
  reviewer        User         @relation("reviewer", fields: [reviewerId], references: [id])
  revieweeId      String
  reviewee        User         @relation("reviewee", fields: [revieweeId], references: [id])
  tradeRequestId  String       @unique
  tradeRequest    TradeRequest @relation(fields: [tradeRequestId], references: [id])
  stars           Int          // 1–5
  comment         String?
  createdAt       DateTime     @default(now())
}

enum WantRequestUrgency {
  FLEXIBLE
  WITHIN_WEEK
  WITHIN_3_DAYS
}

model WantRequest {
  id          String             @id @default(cuid())
  userId      String
  user        User               @relation(fields: [userId], references: [id])
  category    String
  description String
  budget      Int?               // max price in paise
  urgency     WantRequestUrgency @default(FLEXIBLE)
  expiresAt   DateTime
  createdAt   DateTime           @default(now())
}

model Referral {
  id            String    @id @default(cuid())
  referrerId    String
  referrer      User      @relation("referrer", fields: [referrerId], references: [id])
  referredId    String    @unique
  referred      User      @relation("referred", fields: [referredId], references: [id])
  convertedAt   DateTime? // set when referred user completes first trade
  rewardIssued  Boolean   @default(false)
  createdAt     DateTime  @default(now())
}
```

---

## API routes

All routes are prefixed `/api/v1`. Authentication via Clerk JWT (`Authorization: Bearer <token>`). All request bodies validated with Zod before reaching the controller.

### Auth & users
| Method | Route | Description |
|---|---|---|
| POST | `/auth/webhook` | Clerk webhook — syncs new user to DB |
| GET | `/users/me` | Current user profile |
| PATCH | `/users/me` | Update profile (hostel, display name) |
| GET | `/users/:username` | Public profile |

### Listings
| Method | Route | Description |
|---|---|---|
| GET | `/listings` | Browse listings. Query: `category`, `type`, `condition`, `minPrice`, `maxPrice`, `collegeId`, `search`, `page`, `limit` |
| POST | `/listings` | Create listing. Body: `CreateListingDto` |
| POST | `/listings/bulk` | Bulk create from parsed CSV array |
| GET | `/listings/:id` | Single listing detail |
| PATCH | `/listings/:id` | Update listing (owner only) |
| DELETE | `/listings/:id` | Archive listing (owner only, sets status ARCHIVED) |
| POST | `/listings/:id/photos` | Upload photos to Cloudinary, attach to listing |

### Trades
| Method | Route | Description |
|---|---|---|
| POST | `/trades` | Create trade offer. Body: `{ listingId, offerAmount?, offerNote? }` |
| GET | `/trades/:id` | Get trade details |
| PATCH | `/trades/:id/accept` | Seller accepts offer |
| PATCH | `/trades/:id/cancel` | Either party cancels |
| POST | `/trades/:id/qr/generate` | Generate QR handoff tokens (called after accept) |
| POST | `/trades/:id/qr/scan` | Scan QR token. Body: `{ token }`. Validates token, marks scan timestamp. Triggers completion when both scanned. |
| POST | `/trades/:id/dispute` | Raise dispute (within 24h of completion) |

### Rentals
| Method | Route | Description |
|---|---|---|
| POST | `/rentals` | Create rental booking. Body: `{ listingId, startDate, endDate }` |
| GET | `/rentals/:id` | Get rental details |
| POST | `/rentals/:id/pay` | Initiate Razorpay order for deposit + rental cost |
| POST | `/rentals/:id/payment-confirm` | Razorpay webhook confirms payment, activates rental |
| POST | `/rentals/:id/pickup-confirm` | QR scan at pickup — starts rental timer |
| POST | `/rentals/:id/return-confirm` | QR scan at return — triggers deposit release flow |
| POST | `/rentals/:id/dispute` | Raise damage dispute (within 6h of return) |

### Want requests
| Method | Route | Description |
|---|---|---|
| GET | `/requests` | Browse want requests. Query: `category`, `urgency`, `collegeId` |
| POST | `/requests` | Create want request |
| DELETE | `/requests/:id` | Delete own request |

### Messages
| Method | Route | Description |
|---|---|---|
| GET | `/messages` | All conversations for current user |
| GET | `/messages/:tradeId` | Message history for a trade |
| POST | `/messages/:tradeId` | Send message (also emits via Socket.io) |

### Notifications
| Method | Route | Description |
|---|---|---|
| GET | `/notifications` | All notifications for current user |
| PATCH | `/notifications/read-all` | Mark all read |

### Referrals
| Method | Route | Description |
|---|---|---|
| GET | `/referrals/me` | Current user's referral stats + link |
| POST | `/referrals/apply` | Apply referral code on signup. Body: `{ referralCode }` |

### Admin
| Method | Route | Description |
|---|---|---|
| GET | `/admin/reports` | All flagged listings and users |
| PATCH | `/admin/listings/:id/suspend` | Suspend listing |
| PATCH | `/admin/users/:id/suspend` | Suspend user |
| GET | `/admin/disputes` | All open disputes |
| PATCH | `/admin/disputes/:id/resolve` | Resolve dispute with outcome |

---

## Feature specs

### Trade state machine

Valid transitions ONLY (throw `BadRequestException` for invalid transitions):

```
OPEN → OFFER_MADE          (buyer submits offer)
OFFER_MADE → OFFER_ACCEPTED (seller accepts)
OFFER_MADE → CANCELLED      (seller rejects OR buyer withdraws)
OFFER_ACCEPTED → HANDOFF_PENDING (QR codes generated)
HANDOFF_PENDING → COMPLETED (both QR tokens scanned)
HANDOFF_PENDING → CANCELLED (either party cancels before scan)
COMPLETED → DISPUTED        (dispute raised within 24h)
```

Implement as a `TradeStateMachine` service class with explicit transition methods. Never set `status` directly in a controller.

### QR handoff logic

```typescript
// On /trades/:id/qr/scan:
// 1. Find QrHandoff by token (buyerToken OR sellerToken)
// 2. Check expiresAt > now(). If expired, throw 410 Gone.
// 3. Determine which party is scanning (buyer vs seller) from token match
// 4. Set buyerScannedAt or sellerScannedAt = now()
// 5. If BOTH timestamps are set → call tradeStateMachine.complete(trade)
//    which sets status=COMPLETED, archives listing, triggers review prompt notifications
// 6. Return { status: 'scanned', complete: boolean }
```

### Expiry nudge cron job

```typescript
// Run daily at 06:00 IST (00:30 UTC)
// @Cron('30 0 * * *')
// Query: listings where status=OPEN AND createdAt < (now - 30 days) AND tradeRequests.count = 0
// For each: send push + email with 'Lower price or donate?' CTA
// After 60 days total: set status=ARCHIVED, send archived notification
```

### Auto-match engine

```typescript
// Trigger: on Listing creation (POST /listings)
// Query WantRequests where:
//   - collegeId matches listing.user.collegeId
//   - category matches listing.category
//   - budget >= listing.price OR budget IS NULL
//   - expiresAt > now()
// For each match: send notification to wantRequest.userId
//   "A new listing matches your request for [category]"
```

### Trust score calculation

Recalculate on every new Review:

```typescript
// trustScore = (
//   (completedTrades_count * 0.4) capped at 2.0
//   + (avg_stars_received * 0.4)              // 0–2.0
//   + (response_rate * 0.1)                   // 0–0.5 (% of messages replied within 24h)
//   + (account_age_months / 24 * 0.1)         // 0–0.5, capped at 24 months
// ) normalised to 0.0–5.0
```

### Bulk CSV upload flow

```typescript
// Frontend: papaparse parses CSV → preview table with validation highlighting
// Required CSV columns: title, category, condition, price, description, type
// Optional: deposit_amount, daily_rate, min_rental_days, max_rental_days
// Validation per row (Zod): same schema as CreateListingDto
// Invalid rows shown in red with error message inline — user fixes before submit
// POST /listings/bulk with array of validated listing objects
// Returns: { created: number, failed: { row: number, error: string }[] }
```

### Rental deposit flow (Razorpay)

```typescript
// 1. POST /rentals — create rental record with status=PENDING_PAYMENT
// 2. POST /rentals/:id/pay — create Razorpay order for (dailyRate * days + deposit)
// 3. Frontend opens Razorpay checkout. On success, POST /rentals/:id/payment-confirm
// 4. Webhook validates Razorpay signature. Sets status=ACTIVE. Records razorpayPaymentId.
// 5. On return-confirm: if no dispute within 6h, initiate Razorpay refund for deposit amount only.
// 6. If dispute: admin resolves. Admin can trigger partial or full deposit transfer via /admin/disputes/:id/resolve
```

---

## Category-specific fields

Implement as `ListingField` EAV rows. The frontend renders dynamic form fields based on selected category. Backend validates that required fields are present per category.

```typescript
export const CATEGORY_FIELDS: Record<string, { key: string; label: string; required: boolean; type: 'text' | 'boolean' | 'select' }[]> = {
  'Books & Study Materials': [
    { key: 'isbn', label: 'ISBN', required: false, type: 'text' },
    { key: 'edition', label: 'Edition / Year', required: true, type: 'text' },
    { key: 'subject', label: 'Subject', required: true, type: 'text' },
    { key: 'course_code', label: 'Course Code', required: false, type: 'text' },
    { key: 'has_highlights', label: 'Highlights present?', required: true, type: 'boolean' },
    { key: 'has_notes', label: 'Notes written inside?', required: true, type: 'boolean' },
  ],
  'Electronics & Gadgets': [
    { key: 'brand', label: 'Brand', required: true, type: 'text' },
    { key: 'model', label: 'Model Number', required: false, type: 'text' },
    { key: 'warranty_status', label: 'Warranty Status', required: true, type: 'select' },
    { key: 'charger_included', label: 'Charger Included?', required: true, type: 'boolean' },
  ],
  'Clothing & Formals': [
    { key: 'size', label: 'Size', required: true, type: 'select' },
    { key: 'brand', label: 'Brand', required: false, type: 'text' },
    { key: 'wash_count', label: 'Approx. wash count', required: false, type: 'text' },
    { key: 'gender', label: 'Gender', required: true, type: 'select' },
  ],
  'Lab & Engineering Equipment': [
    { key: 'subject', label: 'Subject / Lab', required: true, type: 'text' },
    { key: 'calibrated', label: 'Calibrated?', required: false, type: 'boolean' },
  ],
  'Furniture': [
    { key: 'dimensions', label: 'Dimensions (cm)', required: false, type: 'text' },
    { key: 'assembly_required', label: 'Assembly Required?', required: true, type: 'boolean' },
  ],
};
```

---

## Pages

| Route | Component | Auth | Notes |
|---|---|---|---|
| `/` | `HomePage` | No | SSR. Featured listings via `getServerSideProps`. |
| `/explore` | `ExplorePage` | Soft | CSR filter + pagination. |
| `/listing/[id]` | `ListingDetailPage` | Soft | SSR for SEO. |
| `/post` | `PostPage` | Required | Dynamic category fields. CSV upload tab. |
| `/rentals` | `RentalsPage` | No | Filter by duration. Availability calendar widget. |
| `/requests` | `RequestBoardPage` | Required | Browse + post want requests. |
| `/messages` | `MessagesPage` | Required | Socket.io connection on mount. |
| `/messages/[tradeId]` | `ChatPage` | Required | QR handoff button when status=OFFER_ACCEPTED. |
| `/dashboard` | `DashboardPage` | Required | Active listings, live rental timers, incoming offers. |
| `/profile/[username]` | `ProfilePage` | No | SSR for SEO. |
| `/notifications` | `NotificationsPage` | Required | |
| `/search` | `SearchPage` | No | Full-text + faceted. |
| `/login` | `LoginPage` | No | Clerk `<SignIn />` component. |
| `/signup` | `SignupPage` | No | Clerk `<SignUp />` + college domain step. |
| `/onboarding` | `OnboardingPage` | Required | Redirect here if profile incomplete. 3-step wizard. |
| `/referrals` | `ReferralsPage` | Required | Referral link, QR poster download, stats. |
| `/admin` | `AdminPage` | Admin role | Reports, disputes, domain management. |

---

## Environment variables

```bash
# .env.example — copy to .env and fill in

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tradehub"

# Redis
REDIS_URL="redis://localhost:6379"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
CLERK_WEBHOOK_SECRET=""

# Razorpay
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Firebase
FIREBASE_PROJECT_ID=""
FIREBASE_PRIVATE_KEY=""
FIREBASE_CLIENT_EMAIL=""

# Email
RESEND_API_KEY=""
EMAIL_FROM="no-reply@tradehub.app"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
API_URL="http://localhost:4000"
JWT_SECRET=""
NODE_ENV="development"
```

---

## Coding conventions

- **Naming:** camelCase for variables/functions, PascalCase for classes/components, SCREAMING_SNAKE_CASE for constants.
- **DTOs:** All request/response shapes defined in `packages/types` as TypeScript interfaces + Zod schemas in `packages/zod-schemas`. Never define inline types in controllers.
- **Error handling:** Use NestJS built-in exceptions (`NotFoundException`, `BadRequestException`, `ForbiddenException`). Map to proper HTTP status codes. Frontend shows toast on API error.
- **Money:** All monetary values stored and transmitted in **paise** (integer). Convert to rupees only at the display layer. Never use floats for money.
- **Dates:** Store as UTC in DB. Display in IST (Asia/Kolkata) in the UI using `date-fns-tz`.
- **Pagination:** All list endpoints use cursor-based pagination via `cursor` + `limit` query params. Return `{ data: [], nextCursor: string | null }`.
- **File uploads:** Never base64-encode uploads. Use multipart/form-data → Cloudinary upload stream.
- **Socket.io rooms:** Each trade has its own room named `trade:<tradeId>`. Users join on chat page mount. Server emits `message:new` and `trade:status_changed` events to the room.

---

## Testing requirements

Every PR must include:
- Unit tests for all service methods (Vitest)
- Integration tests for all API routes (Supertest against in-memory test DB)
- At minimum test: happy path, auth failure (401), invalid input (400), not-found (404)
- Trade state machine must have tests for every valid transition AND every invalid transition (expect `BadRequestException`)

Run tests: `pnpm test`  
Run with coverage: `pnpm test:coverage` (must be > 80%)

---

## Phase plan

Work through phases in order. Do not start a phase until all tests in the prior phase pass.

| Phase | Scope |
|---|---|
| **0 — Setup** | Monorepo scaffold, Prisma schema, env config, Railway + Vercel deploy pipelines, Clerk auth basic flow |
| **1 — Listings** | CRUD, photo upload, search/filter, explore page, listing detail page, category fields |
| **2 — Trades** | Offer flow, state machine, in-app chat (Socket.io), QR handoff, ratings |
| **3 — Rentals** | Availability calendar, Razorpay deposit escrow, rental timer, return QR, late escalation cron |
| **4 — Add-ons** | Wish list board + auto-match, bulk CSV upload, expiry nudge cron, referral system |
| **5 — Trust & Safety** | Admin panel, report flow, dispute resolution, trust score calculation |
| **6 — Polish** | Push notifications, email flows, PWA manifest, Lighthouse audit (target: 90+ performance), beta launch |

---

## Known constraints & decisions

- **No cross-college trading at MVP.** Listings are scoped to the listing owner's college. This is enforced at the DB query level (always filter by `user.collegeId`).
- **No in-app wallet.** All payments go through Razorpay directly. Deposit refunds are Razorpay refunds, not credits.
- **Soft deletes only.** Never hard-delete listings, trades, or users. Set `status=ARCHIVED` or a `deletedAt` timestamp. Required for dispute resolution history.
- **Images are immutable after upload.** Once a Cloudinary URL is stored, never replace it. Add new photos, mark old ones inactive.
- **Prices in paise, always.** Do not make exceptions. If Razorpay or any external system uses rupees, convert at the integration boundary.
