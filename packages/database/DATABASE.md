# Database Schema v2

Comprehensive schema for Moolah's Neon Postgres database. 18 tables across 7 domains. Designed for the offerwall business model where publishers embed offerwalls, end users complete offers and surveys, and publishers receive callbacks on each conversion.

**Changes from v1:**

- `offer_goals` → `offer_events` (industry standard terminology)
- `offer_completions` → `offer_conversions` (conversions, not completions)
- `survey_completions` → `survey_responses` (screenouts are responses, not completions)
- `estimatedLoi` → `loi` (everyone knows LOI)
- Added `anchor` to offers (user-facing title vs internal name)
- Added offer statistics (`clickCount`, `conversionCount`, `epc`)
- Added `clicks` table for attribution and fraud detection
- Improved transaction model: `direction` + `type` + `source` separation
- Added `idempotencyKey` on transactions (prevents duplicate credits from queue retries)
- Added `reversalOfId` on transactions (direct link between original and reversal)
- Added `balanceBefore` on transactions (integrity verification)
- Offer `type` now uses payment model terms (CPI, CPA, CPE) instead of descriptive terms
- Offers store `revenue` (what Moolah earns from provider). Publisher payout is calculated from `revenue * revenueSharePercent / 100`
- Dropped `offerwall_placements` (unnecessary complexity, analytics tracked by offerwallId)

For package usage and setup, see [README.md](./README.md).

---

## Conventions

### Column Naming: camelCase TypeScript, snake_case Database

TypeScript properties use **camelCase**. The actual database column name goes in the string parameter:

```typescript
// CORRECT — camelCase property, snake_case in DB
displayName: text("display_name").notNull(),
avatarUrl: text("avatar_url"),
callbackUrl: text("callback_url").notNull(),
isVerified: boolean("is_verified").notNull().default(false),
createdAt: timestamp("created_at").notNull().defaultNow(),

// WRONG — never use snake_case as the property name
display_name: text("display_name").notNull(), // NO
```

### Money in Cents

All monetary values stored as **integers in cents** (centi-USD) to avoid floating point:

```typescript
revenue: integer("revenue").notNull(),     // 150 = $1.50
amount: integer("amount").notNull(),       // 200 = $2.00
available: integer("available").notNull(), // 50000 = $500.00
```

### Revenue vs Payout

Offers and surveys store `revenue` — what Moolah receives from the provider per conversion. The publisher's payout is **calculated at display time and snapshotted at conversion time**:

```
publisherPayout = revenue × publisher.revenueSharePercent / 100
```

This means the same offer shows different payouts to different publishers based on their revenue share. The end user sees the payout converted to virtual currency via `offerwall.currencyRate`.

### Enum Pattern

Enums defined as `const` objects in `@moolah/domain`, stored as `text` with type assertions in the schema:

```typescript
// In @moolah/domain
export const ConversionStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  REVERSED: "REVERSED",
} as const;
export type ConversionStatus =
  (typeof ConversionStatus)[keyof typeof ConversionStatus];

// In database schema
status: text("status").$type<ConversionStatus>().notNull().default("PENDING"),
```

**Why `text.$type<>()` over `pgEnum`?** Adding values to a pgEnum requires `ALTER TYPE ... ADD VALUE` migrations. During active development, text with TypeScript types is more flexible. pgEnum can be adopted later when the schema stabilizes — it adds DB-level validation and is the stricter choice for production.

### Primary Keys

UUID v4 primary keys generated at the application level:

```typescript
export const primaryId = text("id")
	.primaryKey()
	.$defaultFn(() => crypto.randomUUID());
```

### Timestamps

Every table gets `createdAt` and `updatedAt`. Tables with soft delete also get `deletedAt`:

```typescript
export const timestamps = {
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
};

export const softDeletableTimestamps = {
	...timestamps,
	deletedAt: timestamp("deleted_at")
};
```

### Postgres Arrays

Use native Postgres arrays for multi-value fields that are dynamic and frequently change:

```typescript
countries: text("countries").array().notNull().default([]),
platforms: text("platforms").array().notNull().default([]),
categories: text("categories").array().notNull().default([]),
```

### JSONB for Flexible Data

Use JSONB for semi-structured data that varies by context and doesn't need relational queries:

```typescript
settings: jsonb("settings").$type<OfferwallSettings>().notNull().default({}),
metadata: jsonb("metadata").$type<Record<string, unknown>>(),
```

### Idempotency

Any operation triggered by a queue worker or webhook MUST use an idempotency key to prevent duplicate processing on retries. The `transactions` table enforces this with a unique `idempotencyKey` column.

---

## Money Flow

Understanding how money moves through the system before looking at the tables.

### The Participants

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Provider   │     │    Moolah    │     │  Publisher   │     │   End User   │
│  (AdGate,    │────→│  (platform)  │────→│  (embeds     │────→│  (completes  │
│   Torox,     │     │              │     │   offerwall) │     │   offers)    │
│   CPX, etc.) │     │              │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
  Pays Moolah          Takes margin         Earns payout         Earns virtual
  per conversion       (revenue-payout)     (revenue × share%)   currency
```

### Offer Conversion Flow

```
1. End user clicks offer in offerwall
   → clicks table: new row (OFFER, offer.id)
   → Redirected to provider tracking URL

2. End user completes offer action (install app, sign up, etc.)
   → Provider sends callback to Moolah API

3. Moolah receives inbound callback
   → callback_logs: new row (INBOUND, OFFER_CONVERSION)
   → Validate provider signature
   → Check for duplicates (idempotency)

4. Create conversion record
   → offer_conversions: new row (PENDING)
   → Snapshot revenue and calculate publisherPayout

5. Approve conversion (immediate or after review)
   → offer_conversions: status → APPROVED
   → BEGIN TRANSACTION
       SELECT publisher_balances FOR UPDATE (row lock)
       UPDATE publisher_balances: available += publisherPayout, lifetime += publisherPayout
       INSERT transactions: (CREDIT, ORIGINAL, OFFER_CONVERSION, idempotencyKey)
     COMMIT

6. Send outbound callback to publisher
   → callback_logs: new row (OUTBOUND, OFFER_CONVERSION)
   → Publisher verifies signature, credits end user
   → Retry with exponential backoff on failure
```

### Survey Response Flow

```
1. End user clicks survey in offerwall
   → clicks table: new row (SURVEY, survey.id)
   → Redirected to survey router entry URL

2a. End user COMPLETES survey
   → Survey router sends completion callback
   → survey_responses: new row (COMPLETE)
   → publisher_balances: pending += publisherPayout
   → Wait for reconciliation window (24-72h)
   → After window, if not reversed:
       BEGIN TRANSACTION
         SELECT publisher_balances FOR UPDATE
         UPDATE: pending -= publisherPayout, available += publisherPayout, lifetime += publisherPayout
         INSERT transactions: (CREDIT, ORIGINAL, SURVEY_RESPONSE)
       COMMIT
   → Send outbound callback to publisher

2b. End user SCREENS OUT (doesn't qualify)
   → Survey router sends screenout callback
   → survey_responses: new row (SCREENOUT)
   → If screenout payout enabled:
       Same flow as completion but with reduced payout
       INSERT transactions: (CREDIT, ORIGINAL, SCREENOUT)

2c. RECONCILIATION (router reverses a completion)
   → Survey router sends reconciliation callback
   → survey_responses: status → REVERSED
   → BEGIN TRANSACTION
       SELECT publisher_balances FOR UPDATE
       UPDATE: available -= publisherPayout
       INSERT transactions: (DEBIT, REVERSAL, SURVEY_RESPONSE, reversalOfId)
     COMMIT
   → Send reversal callback to publisher
```

### Payout Flow

```
1. Publisher requests withdrawal
   → Verify: publisher_balances.available >= amount
   → BEGIN TRANSACTION
       SELECT publisher_balances FOR UPDATE
       UPDATE: available -= amount
       INSERT payouts: new row (PENDING)
       INSERT transactions: (DEBIT, ORIGINAL, PAYOUT)
     COMMIT

2. Process payment (PayPal, Wise, wire, crypto)
   → payouts: status → PROCESSING
   → Send to payment provider

3a. Payment succeeds
   → payouts: status → COMPLETED, externalPaymentId set

3b. Payment fails
   → payouts: status → FAILED
   → BEGIN TRANSACTION
       SELECT publisher_balances FOR UPDATE
       UPDATE: available += amount (refund)
       INSERT transactions: (CREDIT, REVERSAL, PAYOUT, reversalOfId)
     COMMIT
```

### Reversal Flow (Fraud/Chargeback)

```
1. Fraud detected or provider sends reversal
   → offer_conversions/survey_responses: status → REVERSED
   → fraud_events: new row (if fraud-related)
   → BEGIN TRANSACTION
       SELECT publisher_balances FOR UPDATE
       UPDATE: available -= publisherPayout
       INSERT transactions: (DEBIT, REVERSAL, source, reversalOfId → original txn)
     COMMIT
   → Send reversal callback to publisher
```

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION & IDENTITY                                               │
│                                                                         │
│  accounts ──┬── sessions                                                │
│             └── publishers ──── offerwalls                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ offerwallId
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ END USERS (no auth, tracked per offerwall)                              │
│                                                                         │
│  end_users ──── end_user_profiles (demographics for survey targeting)   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ endUserId
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ SUPPLY SIDE                                                             │
│                                                                         │
│  providers ──┬── offers ──── offer_events (multi-step milestones)       │
│              └── surveys                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ offerId / surveyId
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ACTIVITY & CONVERSIONS                                                  │
│                                                                         │
│  clicks (offer + survey clicks for attribution & fraud)                 │
│  offer_conversions (approved/rejected/reversed)                         │
│  survey_responses (complete/screenout/reconciled/reversed)              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ triggers financial movement
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ FINANCIAL                                                               │
│                                                                         │
│  publisher_balances (fast-read cache, row-level locking)                │
│  transactions (immutable ledger, idempotent, append-only)               │
│  payouts (withdrawal requests + payment tracking)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ AUDIT & INTEGRITY                                                       │
│                                                                         │
│  callback_logs (inbound from providers, outbound to publishers)         │
│  fraud_events (detection, evidence, resolution)                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Schema Reference

### Authentication & Identity

#### 1. accounts

Single source of login identity. Publishers (and future advertisers) extend this via capability tables rather than role enums. An account can be both a publisher AND an advertiser — capability tables avoid complex role hierarchies.

| Column        | Type          | Notes                                 |
| ------------- | ------------- | ------------------------------------- |
| id            | `text` PK     | UUID v4                               |
| email         | `text` UNIQUE | Login email                           |
| passwordHash  | `text`        | Argon2 hash                           |
| isAdmin       | `boolean`     | Platform admin flag                   |
| status        | `text`        | `ACTIVE` / `SUSPENDED` / `BANNED`     |
| lastLoginAt   | `timestamp`   |                                       |
| ...timestamps |               | `createdAt`, `updatedAt`, `deletedAt` |

```typescript
export const accounts = pgTable("accounts", {
	id: primaryId,
	email: text("email").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	isAdmin: boolean("is_admin").notNull().default(false),
	status: text("status").$type<AccountStatus>().notNull().default("ACTIVE"),
	lastLoginAt: timestamp("last_login_at"),
	...softDeletableTimestamps
});
```

---

#### 2. sessions

Stateless session tokens for authenticated accounts.

| Column    | Type          | Notes                |
| --------- | ------------- | -------------------- |
| id        | `text` PK     | UUID v4              |
| accountId | `text` FK     | → accounts.id        |
| tokenHash | `text` UNIQUE | Hashed session token |
| ipAddress | `text`        |                      |
| userAgent | `text`        |                      |
| expiresAt | `timestamp`   |                      |
| createdAt | `timestamp`   |                      |

```typescript
export const sessions = pgTable("sessions", {
	id: primaryId,
	accountId: text("account_id")
		.notNull()
		.references(() => accounts.id, { onDelete: "cascade" }),
	tokenHash: text("token_hash").notNull().unique(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow()
});
```

---

#### 3. publishers

Publisher capability table. 1:1 extension of accounts. A publisher embeds offerwalls to monetize their audience.

| Column              | Type             | Notes                                           |
| ------------------- | ---------------- | ----------------------------------------------- |
| id                  | `text` PK        | UUID v4                                         |
| accountId           | `text` FK UNIQUE | → accounts.id (1:1)                             |
| name                | `text`           | Company/site name                               |
| website             | `text`           | Publisher's primary website                     |
| apiKey              | `text` UNIQUE    | Auto-generated, used in callbacks               |
| apiSecret           | `text`           | For signing outbound callback payloads          |
| status              | `text`           | `PENDING` / `ACTIVE` / `SUSPENDED` / `REJECTED` |
| callbackUrl         | `text`           | Default callback URL for conversions            |
| callbackMethod      | `text`           | `GET` / `POST`                                  |
| revenueSharePercent | `integer`        | Publisher's cut (e.g., 70 = 70%)                |
| minPayoutAmount     | `integer`        | Minimum withdrawal amount in cents              |
| ...timestamps       |                  | `createdAt`, `updatedAt`                        |

```typescript
export const publishers = pgTable("publishers", {
	id: primaryId,
	accountId: text("account_id")
		.notNull()
		.unique()
		.references(() => accounts.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	website: text("website"),
	apiKey: text("api_key")
		.notNull()
		.unique()
		.$defaultFn(() => generateApiKey()),
	apiSecret: text("api_secret")
		.notNull()
		.$defaultFn(() => generateApiSecret()),
	status: text("status").$type<PublisherStatus>().notNull().default("PENDING"),
	callbackUrl: text("callback_url"),
	callbackMethod: text("callback_method").$type<"GET" | "POST">().default("GET"),
	revenueSharePercent: integer("revenue_share_percent").notNull().default(70),
	minPayoutAmount: integer("min_payout_amount").notNull().default(5000),
	...timestamps
});
```

---

#### 4. offerwalls

Per-publisher offerwall configurations. A publisher can have multiple offerwalls (e.g., one for their mobile app, one for their website). Each offerwall has its own settings, appearance, and callback configuration.

| Column         | Type          | Notes                                               |
| -------------- | ------------- | --------------------------------------------------- |
| id             | `text` PK     | UUID v4                                             |
| publisherId    | `text` FK     | → publishers.id                                     |
| name           | `text`        | "My App Offerwall", "Website Widget"                |
| slug           | `text` UNIQUE | URL-safe identifier for embed URLs                  |
| status         | `text`        | `ACTIVE` / `PAUSED` / `ARCHIVED`                    |
| allowedDomains | `text[]`      | Domains allowed to embed this offerwall             |
| callbackUrl    | `text`        | Override publisher default                          |
| callbackSecret | `text`        | Per-offerwall HMAC signing secret                   |
| currencyName   | `text`        | "Coins", "Points", "Credits"                        |
| currencyRate   | `integer`     | Cents per 1 currency unit (e.g., 100 = $1 per coin) |
| settings       | `jsonb`       | Appearance, filtering, survey config                |
| ...timestamps  |               | `createdAt`, `updatedAt`                            |

```typescript
export const offerwalls = pgTable("offerwalls", {
	id: primaryId,
	publisherId: text("publisher_id")
		.notNull()
		.references(() => publishers.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	status: text("status").$type<OfferwallStatus>().notNull().default("ACTIVE"),
	allowedDomains: text("allowed_domains").array().notNull().default([]),
	callbackUrl: text("callback_url"),
	callbackSecret: text("callback_secret")
		.notNull()
		.$defaultFn(() => generateSecret()),
	currencyName: text("currency_name").notNull().default("Coins"),
	currencyRate: integer("currency_rate").notNull().default(100),
	settings: jsonb("settings").$type<OfferwallSettings>().notNull().default({}),
	...timestamps
});
```

**OfferwallSettings JSONB shape:**

```typescript
interface OfferwallSettings {
	// Appearance
	theme?: "light" | "dark" | "auto";
	accentColor?: string;
	logoUrl?: string;

	// Content filtering
	enableOffers?: boolean;
	enableSurveys?: boolean;
	offerCategories?: string[];
	minPayout?: number;

	// Survey settings
	surveyProfilingEnabled?: boolean;

	// Localization
	defaultLocale?: string;
	supportedLocales?: string[];
}
```

---

### Supply Side

#### 5. providers

External ad networks and survey routers that supply offers and surveys to the platform. Shared table for both offer providers (Torox, AdGate, Ayet Studios) and survey providers (CPX Research, Cint, Theorem Reach).

| Column              | Type          | Notes                                                |
| ------------------- | ------------- | ---------------------------------------------------- |
| id                  | `text` PK     | UUID v4                                              |
| name                | `text`        | "Torox", "CPX Research", "Cint"                      |
| slug                | `text` UNIQUE | URL-safe identifier                                  |
| type                | `text`        | `OFFER_NETWORK` / `SURVEY_ROUTER`                    |
| status              | `text`        | `ACTIVE` / `PAUSED` / `DISABLED`                     |
| apiBaseUrl          | `text`        | Provider's API endpoint                              |
| apiKey              | `text`        | Our key for their API                                |
| apiSecret           | `text`        | Shared secret for signature verification             |
| callbackSecret      | `text`        | Secret for verifying inbound callbacks from them     |
| revenueSharePercent | `integer`     | What we pay them (e.g., 80 = 80% of advertiser cost) |
| priority            | `integer`     | Display ordering (lower = higher priority)           |
| settings            | `jsonb`       | Provider-specific config (see below)                 |
| ...timestamps       |               | `createdAt`, `updatedAt`                             |

```typescript
export const providers = pgTable("providers", {
	id: primaryId,
	name: text("name").notNull(),
	slug: text("slug").notNull().unique(),
	type: text("type").$type<ProviderType>().notNull(),
	status: text("status").$type<ProviderStatus>().notNull().default("ACTIVE"),
	apiBaseUrl: text("api_base_url"),
	apiKey: text("api_key"),
	apiSecret: text("api_secret"),
	callbackSecret: text("callback_secret"),
	revenueSharePercent: integer("revenue_share_percent").notNull().default(80),
	priority: integer("priority").notNull().default(100),
	settings: jsonb("settings").$type<Record<string, unknown>>(),
	...timestamps
});
```

**Provider settings vary by type:**

```typescript
// Offer network (Torox, AdGate)
interface OfferNetworkSettings {
	callbackSignatureMethod: "md5" | "sha256" | "hmac_sha256";
	callbackSignatureParam: string;
	feedUrl: string;
	feedFormat: "json" | "xml";
	feedSyncIntervalMinutes: number;
}

// Survey router (CPX Research, Cint)
interface SurveyRouterSettings {
	callbackSignatureMethod: "hmac_sha256";
	reconciliationWindowHours: number;
	screenoutPayoutEnabled: boolean;
	screenoutPayoutPercent: number;
	qualityScoreThreshold: number;
	profilingRequired: boolean;
}
```

---

#### 6. offers

Individual offers from ad networks. An offer is a task the end user completes for a reward: install an app, sign up for a service, play a game to level X, etc.

**Key naming:**

- `name`: Internal name, often from provider ("Raid Shadow Legends - Plarium - CPI Android")
- `anchor`: User-facing title displayed in the offerwall ("Play Raid Shadow Legends & Earn!")
- `revenue`: What Moolah receives from the provider per conversion (cents)

| Column          | Type        | Notes                                                        |
| --------------- | ----------- | ------------------------------------------------------------ |
| id              | `text` PK   | UUID v4                                                      |
| providerId      | `text` FK   | → providers.id                                               |
| externalId      | `text`      | Provider's ID for this offer                                 |
| name            | `text`      | Internal name (from provider)                                |
| anchor          | `text`      | User-facing title displayed in offerwall                     |
| description     | `text`      | Short description for the user                               |
| instructions    | `text`      | Step-by-step completion guide                                |
| type            | `text`      | `CPI` / `CPA` / `CPE` / `CPL` / `CPS` / `OTHER`              |
| status          | `text`      | `ACTIVE` / `PAUSED` / `EXPIRED` / `DISABLED`                 |
| url             | `text`      | Tracking URL (with macros)                                   |
| iconUrl         | `text`      | Offer icon/thumbnail                                         |
| creativeUrl     | `text`      | Banner or promotional image                                  |
| revenue         | `integer`   | What Moolah earns per conversion (cents)                     |
| countries       | `text[]`    | Geo-targeting (ISO 3166-1 alpha-2)                           |
| platforms       | `text[]`    | `ANDROID` / `IOS` / `DESKTOP` / `ALL`                        |
| categories      | `text[]`    | `GAME` / `SHOPPING` / `FINANCE` / `CRYPTO` / `SIGNUP` / etc. |
| isFeatured      | `boolean`   | Highlighted in the offerwall                                 |
| isMultiEvent    | `boolean`   | Has multiple completion events/milestones                    |
| dailyCap        | `integer`   | Max conversions per day (null = unlimited)                   |
| totalCap        | `integer`   | Max conversions total (null = unlimited)                     |
| conversionTime  | `integer`   | Minutes until conversion confirms (for display)              |
| sessionHours    | `integer`   | Hours user has to complete the offer                         |
| clickCount      | `integer`   | Denormalized total clicks                                    |
| conversionCount | `integer`   | Denormalized total conversions                               |
| epc             | `integer`   | Earnings per click in cents (cached, updated periodically)   |
| expiresAt       | `timestamp` | When the offer expires                                       |
| ...timestamps   |             | `createdAt`, `updatedAt`                                     |

**Unique constraint:** `(providerId, externalId)` — prevents duplicate imports from the same provider.

```typescript
export const offers = pgTable(
	"offers",
	{
		id: primaryId,
		providerId: text("provider_id")
			.notNull()
			.references(() => providers.id),
		externalId: text("external_id").notNull(),
		name: text("name").notNull(),
		anchor: text("anchor"),
		description: text("description"),
		instructions: text("instructions"),
		type: text("type").$type<OfferType>().notNull(),
		status: text("status").$type<OfferStatus>().notNull().default("ACTIVE"),
		url: text("url").notNull(),
		iconUrl: text("icon_url"),
		creativeUrl: text("creative_url"),
		revenue: integer("revenue").notNull(),
		countries: text("countries").array().notNull().default([]),
		platforms: text("platforms").array().notNull().default([]),
		categories: text("categories").array().notNull().default([]),
		isFeatured: boolean("is_featured").notNull().default(false),
		isMultiEvent: boolean("is_multi_event").notNull().default(false),
		dailyCap: integer("daily_cap"),
		totalCap: integer("total_cap"),
		conversionTime: integer("conversion_time"),
		sessionHours: integer("session_hours"),
		clickCount: integer("click_count").notNull().default(0),
		conversionCount: integer("conversion_count").notNull().default(0),
		epc: integer("epc").notNull().default(0),
		expiresAt: timestamp("expires_at"),
		...timestamps
	},
	(table) => [unique("offers_provider_external_idx").on(table.providerId, table.externalId)]
);
```

---

#### 7. offer_events

Multi-step offer milestones. Some offers have multiple events (e.g., "Reach Level 5" = 50¢, "Reach Level 15" = $1.50, "Reach Level 30" = $5.00). Each event triggers a separate callback from the provider.

| Column          | Type        | Notes                            |
| --------------- | ----------- | -------------------------------- |
| id              | `text` PK   | UUID v4                          |
| offerId         | `text` FK   | → offers.id                      |
| externalEventId | `text`      | Provider's event/milestone ID    |
| name            | `text`      | "Reach Level 15"                 |
| description     | `text`      |                                  |
| revenue         | `integer`   | What Moolah earns (cents)        |
| sortOrder       | `integer`   | Display ordering (1, 2, 3...)    |
| status          | `text`      | `ACTIVE` / `PAUSED` / `DISABLED` |
| createdAt       | `timestamp` |                                  |

```typescript
export const offerEvents = pgTable("offer_events", {
	id: primaryId,
	offerId: text("offer_id")
		.notNull()
		.references(() => offers.id, { onDelete: "cascade" }),
	externalEventId: text("external_event_id").notNull(),
	name: text("name").notNull(),
	description: text("description"),
	revenue: integer("revenue").notNull(),
	sortOrder: integer("sort_order").notNull().default(1),
	status: text("status").$type<OfferEventStatus>().notNull().default("ACTIVE"),
	createdAt: timestamp("created_at").notNull().defaultNow()
});
```

---

#### 8. surveys

Survey opportunities from survey routers. Fundamentally different from offers:

- **Qualification-based**: Users must match demographic criteria
- **Variable payout**: Based on length of interview (LOI) and incidence rate
- **Screenouts**: Users can start but get disqualified mid-survey
- **Reconciliation**: Completions can be reversed during a reconciliation window (24-72h)
- **Real-time availability**: Surveys appear/disappear based on quotas

| Column         | Type        | Notes                                                  |
| -------------- | ----------- | ------------------------------------------------------ |
| id             | `text` PK   | UUID v4                                                |
| providerId     | `text` FK   | → providers.id                                         |
| externalId     | `text`      | Survey router's ID                                     |
| name           | `text`      | Usually auto-generated ("3-min Opinion Survey")        |
| description    | `text`      |                                                        |
| status         | `text`      | `ACTIVE` / `CLOSED` / `FULL`                           |
| category       | `text`      | `OPINION` / `PRODUCT` / `ACADEMIC` / `MARKET_RESEARCH` |
| revenue        | `integer`   | What Moolah earns per completion (cents)               |
| loi            | `integer`   | Length of interview in minutes                         |
| incidenceRate  | `integer`   | Qualification rate percentage (e.g., 45 = 45%)         |
| countries      | `text[]`    | Geo-targeting                                          |
| entryUrl       | `text`      | URL to start the survey (with macros)                  |
| quotaRemaining | `integer`   | Remaining completes allowed (null = unlimited)         |
| isFeatured     | `boolean`   |                                                        |
| clickCount     | `integer`   | Denormalized total clicks                              |
| responseCount  | `integer`   | Denormalized total responses                           |
| startsAt       | `timestamp` |                                                        |
| expiresAt      | `timestamp` |                                                        |
| ...timestamps  |             | `createdAt`, `updatedAt`                               |

**Unique constraint:** `(providerId, externalId)`

```typescript
export const surveys = pgTable(
	"surveys",
	{
		id: primaryId,
		providerId: text("provider_id")
			.notNull()
			.references(() => providers.id),
		externalId: text("external_id").notNull(),
		name: text("name").notNull(),
		description: text("description"),
		status: text("status").$type<SurveyStatus>().notNull().default("ACTIVE"),
		category: text("category").$type<SurveyCategory>(),
		revenue: integer("revenue").notNull(),
		loi: integer("loi"),
		incidenceRate: integer("incidence_rate"),
		countries: text("countries").array().notNull().default([]),
		entryUrl: text("entry_url").notNull(),
		quotaRemaining: integer("quota_remaining"),
		isFeatured: boolean("is_featured").notNull().default(false),
		clickCount: integer("click_count").notNull().default(0),
		responseCount: integer("response_count").notNull().default(0),
		startsAt: timestamp("starts_at"),
		expiresAt: timestamp("expires_at"),
		...timestamps
	},
	(table) => [unique("surveys_provider_external_idx").on(table.providerId, table.externalId)]
);
```

---

### End Users

#### 9. end_users

People who complete offers and surveys. NOT authenticated users — tracked per-offerwall via the publisher's external user ID. No password, no email. The publisher identifies them.

| Column           | Type        | Notes                                     |
| ---------------- | ----------- | ----------------------------------------- |
| id               | `text` PK   | UUID v4                                   |
| offerwallId      | `text` FK   | → offerwalls.id                           |
| externalUserId   | `text`      | Publisher's user ID for this person       |
| ipAddress        | `text`      | Last known IP                             |
| userAgent        | `text`      | Last known UA                             |
| country          | `text`      | Geo from IP (ISO 3166-1 alpha-2)          |
| totalEarned      | `integer`   | Lifetime earnings in cents (denormalized) |
| offerConversions | `integer`   | Count (denormalized)                      |
| surveyResponses  | `integer`   | Count (denormalized)                      |
| isFlagged        | `boolean`   | Fraud flag                                |
| lastActiveAt     | `timestamp` |                                           |
| ...timestamps    |             | `createdAt`, `updatedAt`                  |

**Unique constraint:** `(offerwallId, externalUserId)` — same person across different offerwalls creates separate records.

```typescript
export const endUsers = pgTable(
	"end_users",
	{
		id: primaryId,
		offerwallId: text("offerwall_id")
			.notNull()
			.references(() => offerwalls.id),
		externalUserId: text("external_user_id").notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		country: text("country"),
		totalEarned: integer("total_earned").notNull().default(0),
		offerConversions: integer("offer_conversions").notNull().default(0),
		surveyResponses: integer("survey_responses").notNull().default(0),
		isFlagged: boolean("is_flagged").notNull().default(false),
		lastActiveAt: timestamp("last_active_at"),
		...timestamps
	},
	(table) => [
		unique("end_users_offerwall_external_idx").on(table.offerwallId, table.externalUserId)
	]
);
```

---

#### 10. end_user_profiles

Demographic data for survey qualification. Collected via profiling questions when surveys are enabled. Used by survey routers to determine eligibility.

| Column           | Type             | Notes                                |
| ---------------- | ---------------- | ------------------------------------ |
| id               | `text` PK        | UUID v4                              |
| endUserId        | `text` FK UNIQUE | → end_users.id (1:1)                 |
| age              | `integer`        |                                      |
| gender           | `text`           |                                      |
| zipCode          | `text`           |                                      |
| educationLevel   | `text`           |                                      |
| employmentStatus | `text`           |                                      |
| householdIncome  | `text`           | Income bracket                       |
| maritalStatus    | `text`           |                                      |
| parentalStatus   | `text`           |                                      |
| ethnicity        | `text`           |                                      |
| language         | `text`           | Primary language                     |
| profileData      | `jsonb`          | Additional profiling answers         |
| completeness     | `integer`        | Percentage of profile filled (0-100) |
| ...timestamps    |                  | `createdAt`, `updatedAt`             |

```typescript
export const endUserProfiles = pgTable("end_user_profiles", {
	id: primaryId,
	endUserId: text("end_user_id")
		.notNull()
		.unique()
		.references(() => endUsers.id, { onDelete: "cascade" }),
	age: integer("age"),
	gender: text("gender"),
	zipCode: text("zip_code"),
	educationLevel: text("education_level"),
	employmentStatus: text("employment_status"),
	householdIncome: text("household_income"),
	maritalStatus: text("marital_status"),
	parentalStatus: text("parental_status"),
	ethnicity: text("ethnicity"),
	language: text("language"),
	profileData: jsonb("profile_data").$type<Record<string, unknown>>(),
	completeness: integer("completeness").notNull().default(0),
	...timestamps
});
```

---

### Activity Tracking

#### 11. clicks

Tracks when an end user clicks an offer or survey in the offerwall. Used for EPC/CVR calculation, click fraud detection, and attribution.

| Column      | Type        | Notes                   |
| ----------- | ----------- | ----------------------- |
| id          | `text` PK   | UUID v4                 |
| endUserId   | `text` FK   | → end_users.id          |
| offerwallId | `text` FK   | → offerwalls.id         |
| targetType  | `text`      | `OFFER` / `SURVEY`      |
| targetId    | `text`      | offers.id or surveys.id |
| ipAddress   | `text`      | IP at click time        |
| userAgent   | `text`      | UA at click time        |
| country     | `text`      | Geo from IP             |
| createdAt   | `timestamp` |                         |

```typescript
export const clicks = pgTable("clicks", {
	id: primaryId,
	endUserId: text("end_user_id")
		.notNull()
		.references(() => endUsers.id),
	offerwallId: text("offerwall_id")
		.notNull()
		.references(() => offerwalls.id),
	targetType: text("target_type").$type<ClickTargetType>().notNull(),
	targetId: text("target_id").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	country: text("country"),
	createdAt: timestamp("created_at").notNull().defaultNow()
});
```

---

### Conversions

#### 12. offer_conversions

When an end user converts on an offer (or an event within a multi-event offer). One row per conversion event. The `revenue` and `payout` columns are snapshots taken at conversion time — they don't change if the offer's revenue changes later.

| Column                | Type        | Notes                                                 |
| --------------------- | ----------- | ----------------------------------------------------- |
| id                    | `text` PK   | UUID v4                                               |
| endUserId             | `text` FK   | → end_users.id                                        |
| offerId               | `text` FK   | → offers.id                                           |
| offerEventId          | `text` FK   | → offer_events.id (null if single-event)              |
| offerwallId           | `text` FK   | → offerwalls.id (denormalized for fast queries)       |
| providerId            | `text` FK   | → providers.id (denormalized)                         |
| status                | `text`      | `PENDING` / `APPROVED` / `REJECTED` / `REVERSED`      |
| revenue               | `integer`   | Snapshot of offer/event revenue at conversion (cents) |
| payout                | `integer`   | Calculated publisher payout at conversion (cents)     |
| externalTransactionId | `text`      | Provider's transaction/click ID                       |
| ipAddress             | `text`      | IP at time of conversion                              |
| userAgent             | `text`      | UA at time of conversion                              |
| approvedAt            | `timestamp` |                                                       |
| rejectedAt            | `timestamp` |                                                       |
| rejectionReason       | `text`      |                                                       |
| ...timestamps         |             | `createdAt`, `updatedAt`                              |

**Unique constraint:** `(providerId, externalTransactionId)` — prevents duplicate conversions from the same provider.

```typescript
export const offerConversions = pgTable(
	"offer_conversions",
	{
		id: primaryId,
		endUserId: text("end_user_id")
			.notNull()
			.references(() => endUsers.id),
		offerId: text("offer_id")
			.notNull()
			.references(() => offers.id),
		offerEventId: text("offer_event_id").references(() => offerEvents.id),
		offerwallId: text("offerwall_id")
			.notNull()
			.references(() => offerwalls.id),
		providerId: text("provider_id")
			.notNull()
			.references(() => providers.id),
		status: text("status").$type<ConversionStatus>().notNull().default("PENDING"),
		revenue: integer("revenue").notNull(),
		payout: integer("payout").notNull(),
		externalTransactionId: text("external_transaction_id"),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		approvedAt: timestamp("approved_at"),
		rejectedAt: timestamp("rejected_at"),
		rejectionReason: text("rejection_reason"),
		...timestamps
	},
	(table) => [
		unique("offer_conversions_provider_txn_idx").on(table.providerId, table.externalTransactionId)
	]
);
```

---

#### 13. survey_responses

When an end user responds to a survey. Different from offer conversions because surveys have screenouts, quality scores, and reconciliation windows.

| Column               | Type        | Notes                                                                                            |
| -------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| id                   | `text` PK   | UUID v4                                                                                          |
| endUserId            | `text` FK   | → end_users.id                                                                                   |
| surveyId             | `text` FK   | → surveys.id                                                                                     |
| offerwallId          | `text` FK   | → offerwalls.id (denormalized)                                                                   |
| providerId           | `text` FK   | → providers.id (denormalized)                                                                    |
| status               | `text`      | `PENDING` / `COMPLETE` / `SCREENOUT` / `QUOTA_FULL` / `QUALITY_FAIL` / `RECONCILED` / `REVERSED` |
| revenue              | `integer`   | Snapshot of survey revenue (cents). 0 for screenouts                                             |
| payout               | `integer`   | Calculated publisher payout (cents)                                                              |
| screenoutPayout      | `integer`   | Partial payout for screenout (cents, if applicable)                                              |
| externalSessionId    | `text`      | Survey router's session ID                                                                       |
| externalRespondentId | `text`      | Router's respondent ID                                                                           |
| qualityScore         | `integer`   | Survey quality score (0-100, from router)                                                        |
| actualLoi            | `integer`   | Actual time spent in minutes                                                                     |
| ipAddress            | `text`      |                                                                                                  |
| userAgent            | `text`      |                                                                                                  |
| startedAt            | `timestamp` | When user entered the survey                                                                     |
| completedAt          | `timestamp` | When user finished                                                                               |
| reconciledAt         | `timestamp` | When reconciliation was processed                                                                |
| ...timestamps        |             | `createdAt`, `updatedAt`                                                                         |

```typescript
export const surveyResponses = pgTable("survey_responses", {
	id: primaryId,
	endUserId: text("end_user_id")
		.notNull()
		.references(() => endUsers.id),
	surveyId: text("survey_id")
		.notNull()
		.references(() => surveys.id),
	offerwallId: text("offerwall_id")
		.notNull()
		.references(() => offerwalls.id),
	providerId: text("provider_id")
		.notNull()
		.references(() => providers.id),
	status: text("status").$type<SurveyResponseStatus>().notNull().default("PENDING"),
	revenue: integer("revenue").notNull(),
	payout: integer("payout").notNull(),
	screenoutPayout: integer("screenout_payout").notNull().default(0),
	externalSessionId: text("external_session_id"),
	externalRespondentId: text("external_respondent_id"),
	qualityScore: integer("quality_score"),
	actualLoi: integer("actual_loi"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	startedAt: timestamp("started_at"),
	completedAt: timestamp("completed_at"),
	reconciledAt: timestamp("reconciled_at"),
	...timestamps
});
```

**Why separate from offer_conversions?**

| Concern          | Offers                   | Surveys                                                      |
| ---------------- | ------------------------ | ------------------------------------------------------------ |
| Completion flow  | Binary: did it or didn't | Multi-outcome: complete, screenout, quota full, quality fail |
| Payout           | Fixed per offer/event    | Variable, screenout partial payouts                          |
| Reconciliation   | None                     | 24-72h reconciliation window                                 |
| Quality          | N/A                      | Quality scores from router                                   |
| Time tracking    | N/A                      | LOI (length of interview) matters                            |
| Session tracking | Transaction ID only      | Session ID + respondent ID                                   |

---

### Financial

#### 14. publisher_balances

Publisher balance tracking. Updated transactionally when conversions are approved. This is the "wallet" — one row per publisher, three balance columns covering every state money can be in.

| Column        | Type             | Notes                                    |
| ------------- | ---------------- | ---------------------------------------- |
| id            | `text` PK        | UUID v4                                  |
| publisherId   | `text` FK UNIQUE | → publishers.id (1:1)                    |
| available     | `integer`        | Available for withdrawal (cents)         |
| pending       | `integer`        | Awaiting approval/reconciliation (cents) |
| lifetime      | `integer`        | Total earned all-time (cents)            |
| lastUpdatedAt | `timestamp`      |                                          |
| ...timestamps |                  | `createdAt`, `updatedAt`                 |

**Row-level locking**: Balance updates use `SELECT ... FOR UPDATE` to prevent race conditions when multiple conversions for the same publisher are processed concurrently.

**Rebuildable**: If `available` or `pending` ever get out of sync, they can be recalculated from the `transactions` table. The transactions table is the source of truth; this table is the fast-read cache.

```typescript
export const publisherBalances = pgTable("publisher_balances", {
	id: primaryId,
	publisherId: text("publisher_id")
		.notNull()
		.unique()
		.references(() => publishers.id, { onDelete: "cascade" }),
	available: integer("available").notNull().default(0),
	pending: integer("pending").notNull().default(0),
	lifetime: integer("lifetime").notNull().default(0),
	lastUpdatedAt: timestamp("last_updated_at"),
	...timestamps
});
```

---

#### 15. transactions

Immutable financial ledger. **Append-only** — rows are never updated or deleted. Every money movement in the system creates exactly one row. This is the source of truth for all financial activity.

Three orthogonal dimensions classify each transaction:

- **`direction`**: Was money added or removed? `CREDIT` / `DEBIT`
- **`type`**: Is this an original entry or undoing a previous one? `ORIGINAL` / `REVERSAL`
- **`source`**: What business event triggered this? `OFFER_CONVERSION` / `SURVEY_RESPONSE` / `SCREENOUT` / `PAYOUT` / `ADJUSTMENT`

| Column         | Type          | Notes                                                                          |
| -------------- | ------------- | ------------------------------------------------------------------------------ |
| id             | `text` PK     | UUID v4                                                                        |
| publisherId    | `text` FK     | → publishers.id                                                                |
| idempotencyKey | `text` UNIQUE | Prevents duplicate transactions from queue retries                             |
| direction      | `text`        | `CREDIT` / `DEBIT`                                                             |
| type           | `text`        | `ORIGINAL` / `REVERSAL`                                                        |
| source         | `text`        | `OFFER_CONVERSION` / `SURVEY_RESPONSE` / `SCREENOUT` / `PAYOUT` / `ADJUSTMENT` |
| amount         | `integer`     | Amount in cents (always positive — direction determines sign)                  |
| balanceBefore  | `integer`     | Publisher's available balance before this transaction (cents)                  |
| balanceAfter   | `integer`     | Publisher's available balance after this transaction (cents)                   |
| referenceType  | `text`        | `OFFER_CONVERSION` / `SURVEY_RESPONSE` / `PAYOUT`                              |
| referenceId    | `text`        | ID of the related entity                                                       |
| reversalOfId   | `text` FK     | → transactions.id (if this is a reversal, points to the original)              |
| description    | `text`        | Human-readable summary                                                         |
| metadata       | `jsonb`       | Additional context (offer name, survey LOI, admin notes)                       |
| createdAt      | `timestamp`   | Immutable — no updatedAt                                                       |

**Integrity invariant:**

```
CREDIT:  balanceAfter = balanceBefore + amount
DEBIT:   balanceAfter = balanceBefore - amount
```

**Idempotency key format:**

```
offer_conversion:{conversionId}:ORIGINAL
survey_response:{responseId}:ORIGINAL
survey_response:{responseId}:REVERSAL
payout:{payoutId}:ORIGINAL
payout:{payoutId}:REVERSAL
```

```typescript
export const transactions = pgTable("transactions", {
	id: primaryId,
	publisherId: text("publisher_id")
		.notNull()
		.references(() => publishers.id),
	idempotencyKey: text("idempotency_key").notNull().unique(),
	direction: text("direction").$type<TransactionDirection>().notNull(),
	type: text("type").$type<TransactionType>().notNull(),
	source: text("source").$type<TransactionSource>().notNull(),
	amount: integer("amount").notNull(),
	balanceBefore: integer("balance_before").notNull(),
	balanceAfter: integer("balance_after").notNull(),
	referenceType: text("reference_type"),
	referenceId: text("reference_id"),
	reversalOfId: text("reversal_of_id").references(() => transactions.id),
	description: text("description"),
	metadata: jsonb("metadata").$type<Record<string, unknown>>(),
	createdAt: timestamp("created_at").notNull().defaultNow()
});
```

**Example transactions for a typical lifecycle:**

```
1. Offer conversion approved ($0.70 publisher payout):
   direction=CREDIT, type=ORIGINAL, source=OFFER_CONVERSION
   amount=70, balanceBefore=5000, balanceAfter=5070
   idempotencyKey="offer_conversion:abc123:ORIGINAL"

2. Survey response completed ($1.20 publisher payout, held pending reconciliation):
   No transaction yet — only publisher_balances.pending is updated.
   Transaction created when reconciliation window passes.

3. Fraud reversal of the offer conversion:
   direction=DEBIT, type=REVERSAL, source=OFFER_CONVERSION
   amount=70, balanceBefore=5070, balanceAfter=5000
   reversalOfId=<txn from step 1>
   idempotencyKey="offer_conversion:abc123:REVERSAL"

4. Publisher requests $40 payout:
   direction=DEBIT, type=ORIGINAL, source=PAYOUT
   amount=4000, balanceBefore=5000, balanceAfter=1000
   idempotencyKey="payout:def456:ORIGINAL"

5. Payout fails, funds returned:
   direction=CREDIT, type=REVERSAL, source=PAYOUT
   amount=4000, balanceBefore=1000, balanceAfter=5000
   reversalOfId=<txn from step 4>
   idempotencyKey="payout:def456:REVERSAL"

6. Admin manual adjustment (+$5 bonus):
   direction=CREDIT, type=ORIGINAL, source=ADJUSTMENT
   amount=500, balanceBefore=5000, balanceAfter=5500
   idempotencyKey="adjustment:ghi789:ORIGINAL"
```

---

#### 16. payouts

Publisher withdrawal/payout requests.

| Column            | Type        | Notes                                                           |
| ----------------- | ----------- | --------------------------------------------------------------- |
| id                | `text` PK   | UUID v4                                                         |
| publisherId       | `text` FK   | → publishers.id                                                 |
| amount            | `integer`   | Withdrawal amount in cents                                      |
| method            | `text`      | `PAYPAL` / `WIRE` / `CRYPTO` / `WISE`                           |
| status            | `text`      | `PENDING` / `PROCESSING` / `COMPLETED` / `FAILED` / `CANCELLED` |
| paymentDetails    | `jsonb`     | Method-specific details (PayPal email, wallet address, etc.)    |
| externalPaymentId | `text`      | Payment processor's transaction ID                              |
| processedAt       | `timestamp` |                                                                 |
| failedAt          | `timestamp` |                                                                 |
| failureReason     | `text`      |                                                                 |
| ...timestamps     |             | `createdAt`, `updatedAt`                                        |

```typescript
export const payouts = pgTable("payouts", {
	id: primaryId,
	publisherId: text("publisher_id")
		.notNull()
		.references(() => publishers.id),
	amount: integer("amount").notNull(),
	method: text("method").$type<PayoutMethod>().notNull(),
	status: text("status").$type<PayoutStatus>().notNull().default("PENDING"),
	paymentDetails: jsonb("payment_details").$type<Record<string, unknown>>(),
	externalPaymentId: text("external_payment_id"),
	processedAt: timestamp("processed_at"),
	failedAt: timestamp("failed_at"),
	failureReason: text("failure_reason"),
	...timestamps
});
```

---

### Audit & Integrity

#### 17. callback_logs

Bidirectional audit trail for all callbacks. Tracks both **inbound** callbacks from providers (when a user completes something) and **outbound** callbacks to publishers (notifying them of conversions).

For reconciliation chains (survey router sends a callback that references a previous callback), `referenceCallbackId` links them together.

| Column              | Type        | Notes                                                                          |
| ------------------- | ----------- | ------------------------------------------------------------------------------ |
| id                  | `text` PK   | UUID v4                                                                        |
| direction           | `text`      | `INBOUND` / `OUTBOUND`                                                         |
| type                | `text`      | `OFFER_CONVERSION` / `SURVEY_RESPONSE` / `SURVEY_SCREENOUT` / `RECONCILIATION` |
| status              | `text`      | `PENDING` / `SENT` / `DELIVERED` / `FAILED` / `RETRYING`                       |
| providerId          | `text` FK   | → providers.id (for inbound)                                                   |
| publisherId         | `text` FK   | → publishers.id (for outbound)                                                 |
| offerwallId         | `text` FK   | → offerwalls.id                                                                |
| conversionId        | `text`      | offer_conversions.id or survey_responses.id                                    |
| referenceCallbackId | `text` FK   | → callback_logs.id (for reconciliation chains)                                 |
| url                 | `text`      | The callback URL that was called                                               |
| method              | `text`      | `GET` / `POST`                                                                 |
| requestHeaders      | `jsonb`     |                                                                                |
| requestBody         | `jsonb`     |                                                                                |
| requestParams       | `jsonb`     | Query parameters                                                               |
| responseStatus      | `integer`   | HTTP status code                                                               |
| responseBody        | `text`      |                                                                                |
| signatureValid      | `boolean`   | Was the HMAC signature valid? (inbound only)                                   |
| attempt             | `integer`   | Retry attempt number (1-based)                                                 |
| maxAttempts         | `integer`   | Max retries configured                                                         |
| nextRetryAt         | `timestamp` | When to retry next (exponential backoff)                                       |
| error               | `text`      | Error message if failed                                                        |
| latencyMs           | `integer`   | Response time in milliseconds                                                  |
| createdAt           | `timestamp` |                                                                                |

```typescript
export const callbackLogs = pgTable("callback_logs", {
	id: primaryId,
	direction: text("direction").$type<CallbackDirection>().notNull(),
	type: text("type").$type<CallbackType>().notNull(),
	status: text("status").$type<CallbackStatus>().notNull().default("PENDING"),
	providerId: text("provider_id").references(() => providers.id),
	publisherId: text("publisher_id").references(() => publishers.id),
	offerwallId: text("offerwall_id").references(() => offerwalls.id),
	conversionId: text("conversion_id"),
	referenceCallbackId: text("reference_callback_id").references(() => callbackLogs.id),
	url: text("url"),
	method: text("method").$type<"GET" | "POST">(),
	requestHeaders: jsonb("request_headers"),
	requestBody: jsonb("request_body"),
	requestParams: jsonb("request_params"),
	responseStatus: integer("response_status"),
	responseBody: text("response_body"),
	signatureValid: boolean("signature_valid"),
	attempt: integer("attempt").notNull().default(1),
	maxAttempts: integer("max_attempts").notNull().default(5),
	nextRetryAt: timestamp("next_retry_at"),
	error: text("error"),
	latencyMs: integer("latency_ms"),
	createdAt: timestamp("created_at").notNull().defaultNow()
});
```

---

#### 18. fraud_events

Fraud detection records. Created by background workers when suspicious activity is detected. Each event captures the evidence, severity, and resolution.

| Column       | Type        | Notes                                                                                                                             |
| ------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| id           | `text` PK   | UUID v4                                                                                                                           |
| type         | `text`      | `DUPLICATE_CONVERSION` / `VELOCITY_ABUSE` / `IP_MISMATCH` / `VPN_DETECTED` / `DEVICE_FARM` / `INVALID_SIGNATURE` / `BOT_DETECTED` |
| severity     | `text`      | `LOW` / `MEDIUM` / `HIGH` / `CRITICAL`                                                                                            |
| endUserId    | `text` FK   | → end_users.id                                                                                                                    |
| offerwallId  | `text` FK   | → offerwalls.id                                                                                                                   |
| conversionId | `text`      | Related conversion ID (offer_conversions or survey_responses)                                                                     |
| ipAddress    | `text`      |                                                                                                                                   |
| details      | `jsonb`     | Evidence and detection metadata                                                                                                   |
| action       | `text`      | `FLAGGED` / `BLOCKED` / `REVERSED` / `IGNORED`                                                                                    |
| reviewedBy   | `text` FK   | → accounts.id (admin who reviewed)                                                                                                |
| reviewedAt   | `timestamp` |                                                                                                                                   |
| createdAt    | `timestamp` |                                                                                                                                   |

```typescript
export const fraudEvents = pgTable("fraud_events", {
	id: primaryId,
	type: text("type").$type<FraudType>().notNull(),
	severity: text("severity").$type<FraudSeverity>().notNull(),
	endUserId: text("end_user_id").references(() => endUsers.id),
	offerwallId: text("offerwall_id").references(() => offerwalls.id),
	conversionId: text("conversion_id"),
	ipAddress: text("ip_address"),
	details: jsonb("details").$type<Record<string, unknown>>(),
	action: text("action").$type<FraudAction>().notNull().default("FLAGGED"),
	reviewedBy: text("reviewed_by").references(() => accounts.id),
	reviewedAt: timestamp("reviewed_at"),
	createdAt: timestamp("created_at").notNull().defaultNow()
});
```

---

## Indexes Strategy

### High-Priority (Core Queries)

```sql
-- Offer browsing (offerwall iframe)
CREATE INDEX offers_status_type_idx ON offers(status, type);
CREATE INDEX offers_active_idx ON offers(status) WHERE status = 'ACTIVE';
CREATE INDEX offers_countries_idx ON offers USING GIN(countries);
CREATE INDEX surveys_active_idx ON surveys(status) WHERE status = 'ACTIVE';
CREATE INDEX surveys_countries_idx ON surveys USING GIN(countries);

-- Click tracking
CREATE INDEX clicks_end_user_idx ON clicks(end_user_id, created_at);
CREATE INDEX clicks_target_idx ON clicks(target_type, target_id, created_at);

-- Conversion lookups
CREATE INDEX offer_conv_end_user_idx ON offer_conversions(end_user_id, offer_id);
CREATE INDEX offer_conv_offerwall_status_idx ON offer_conversions(offerwall_id, status);
CREATE INDEX offer_conv_provider_txn_idx ON offer_conversions(provider_id, external_transaction_id);
CREATE INDEX survey_resp_end_user_idx ON survey_responses(end_user_id, survey_id);
CREATE INDEX survey_resp_offerwall_status_idx ON survey_responses(offerwall_id, status);

-- End user identification
-- (covered by UNIQUE constraint on offerwallId + externalUserId)

-- Publisher dashboard
CREATE INDEX offer_conv_offerwall_date_idx ON offer_conversions(offerwall_id, created_at);
CREATE INDEX survey_resp_offerwall_date_idx ON survey_responses(offerwall_id, created_at);
CREATE INDEX transactions_publisher_date_idx ON transactions(publisher_id, created_at);

-- Transaction queries
CREATE INDEX transactions_direction_idx ON transactions(direction, created_at);
CREATE INDEX transactions_source_idx ON transactions(source, created_at);
CREATE INDEX transactions_reference_idx ON transactions(reference_type, reference_id);
CREATE INDEX transactions_reversal_idx ON transactions(reversal_of_id) WHERE reversal_of_id IS NOT NULL;

-- Callback processing
CREATE INDEX callback_logs_retry_idx ON callback_logs(status, next_retry_at)
  WHERE status = 'RETRYING';
CREATE INDEX callback_logs_conversion_idx ON callback_logs(conversion_id, direction);

-- Fraud detection
CREATE INDEX fraud_events_end_user_idx ON fraud_events(end_user_id);
CREATE INDEX fraud_events_offerwall_type_idx ON fraud_events(offerwall_id, type);
CREATE INDEX fraud_events_ip_idx ON fraud_events(ip_address);
```

---

## Future: Advertiser Domain

When direct advertiser support is added (self-serve campaign creation):

### advertisers (future)

Advertiser capability table. 1:1 extension of accounts, like publishers.

| Column      | Type             | Notes                               |
| ----------- | ---------------- | ----------------------------------- |
| id          | `text` PK        |                                     |
| accountId   | `text` FK UNIQUE | → accounts.id                       |
| companyName | `text`           |                                     |
| website     | `text`           |                                     |
| status      | `text`           | `PENDING` / `ACTIVE` / `SUSPENDED`  |
| balance     | `integer`        | Prepaid advertising balance (cents) |

### campaigns (future)

Advertiser-created offer campaigns.

| Column          | Type        | Notes                                       |
| --------------- | ----------- | ------------------------------------------- |
| id              | `text` PK   |                                             |
| advertiserId    | `text` FK   | → advertisers.id                            |
| name            | `text`      |                                             |
| type            | `text`      | `CPI` / `CPA` / `CPE`                       |
| status          | `text`      | `DRAFT` / `ACTIVE` / `PAUSED` / `COMPLETED` |
| budget          | `integer`   | Total budget (cents)                        |
| dailyBudget     | `integer`   | Daily cap (cents)                           |
| costPerAction   | `integer`   | CPA in cents                                |
| targetCountries | `text[]`    |                                             |
| targetPlatforms | `text[]`    |                                             |
| startsAt        | `timestamp` |                                             |
| endsAt          | `timestamp` |                                             |

### campaign_creatives (future)

Assets for advertiser campaigns.

| Column     | Type      | Notes                       |
| ---------- | --------- | --------------------------- |
| id         | `text` PK |                             |
| campaignId | `text` FK | → campaigns.id              |
| type       | `text`    | `ICON` / `BANNER` / `VIDEO` |
| url        | `text`    |                             |
| width      | `integer` |                             |
| height     | `integer` |                             |

---

## Migration Path

Current state: SQLite/D1 with a single `users` table (legacy from Disbrowse). Migration plan:

1. **Rewrite utilities** — `utils.ts` and `columns.ts` from SQLite to Postgres (integer timestamps → `timestamp`, integer booleans → native `boolean`)
2. **Create new schemas** — All 18 tables above in `src/schema/`
3. **Update database client** — D1 → Neon serverless (`@neondatabase/serverless` + `drizzle-orm/neon-http`)
4. **Update API env** — `DB: D1Database` → `DATABASE_URL: string`
5. **Update drizzle config** — `dialect: "sqlite"` → `dialect: "postgresql"`, remove `driver: "d1-http"`
6. **Generate and run migrations** — `pnpm --filter api db:generate && pnpm --filter api db:migrate`
7. **Remove legacy** — Drop `users` table and related old types

---

## Domain Enums (in @moolah/domain)

These enums live in `@moolah/domain` and are imported by the database schemas:

```
@moolah/domain
├── account/    → AccountStatus
├── publisher/  → PublisherStatus, OfferwallStatus
├── provider/   → ProviderType, ProviderStatus
├── offer/      → OfferType, OfferStatus, OfferEventStatus
├── survey/     → SurveyStatus, SurveyCategory
├── conversion/ → ConversionStatus, SurveyResponseStatus
├── click/      → ClickTargetType
├── financial/  → TransactionDirection, TransactionType, TransactionSource, PayoutStatus, PayoutMethod
├── callback/   → CallbackDirection, CallbackStatus, CallbackType
└── fraud/      → FraudType, FraudSeverity, FraudAction
```
