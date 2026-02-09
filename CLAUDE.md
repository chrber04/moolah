# Moolah

Online platform for micro jobs and offerwalls. Workers earn money completing tasks posted by employers (data entry, surveys, app testing) or complete advertiser offers to earn rewards. Employers post micro jobs and hire from a global workforce. Publishers embed the offerwall as an iframe to monetize their audience.

## Tech Stack

| Layer              | Technology                             |
| ------------------ | -------------------------------------- |
| Framework          | SvelteKit 2 + Svelte 5                 |
| UI Components      | Bits UI (headless) + custom            |
| Styling            | Tailwind CSS 4 (CSS-based config)      |
| Variants           | CVA (class-variance-authority)         |
| Validation         | Valibot (>1.0)                         |
| Forms              | Superforms                             |
| Icons              | Lucide Svelte                          |
| i18n               | Paraglide JS                           |
| API                | Hono on Cloudflare Workers             |
| Background Workers | Cloudflare Queues + Workers            |
| Database           | Neon Postgres serverless + Drizzle ORM |
| Hosting            | Cloudflare Pages                       |
| Monorepo           | Turborepo + PNPM                       |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│ CLOUDFLARE PAGES (Edge SSR)                                      │
│                                                                  │
│  apps/offerwall  - Iframe embed, tiny bundle (~8KB Svelte)       │
│  apps/main       - Main site, shared component library           │
│  apps/admin      - Admin panel, behind Cloudflare Access         │
└──────────────────────┬───────────────────────────────────────────┘
                       │ Service Bindings
┌──────────────────────▼───────────────────────────────────────────┐
│ CLOUDFLARE WORKERS                                               │
│                                                                  │
│  apps/api        - Hono API, postback ingestion, business logic  │
│  apps/workers    - Queue consumers: postback validation,         │
│                    fraud checks, balance settlement               │
└──────────────────────┬───────────────────────────────────────────┘
                       │ HTTP (serverless driver)
┌──────────────────────▼───────────────────────────────────────────┐
│ NEON POSTGRES (Serverless)                                       │
│                                                                  │
│  Real transactions, row-level locking, write-heavy workload      │
│  Accessed via @neondatabase/serverless HTTP driver                │
└──────────────────────────────────────────────────────────────────┘
```

**Why this stack:**

- **Cloudflare for all compute + caching** - Edge SSR, Workers, Queues, KV
- **Neon Postgres for anything transactional** - D1 not suitable for write-heavy workload (offers, completions, balances). Neon gives real transactions and row-level locking
- **SvelteKit for all frontends** - Tiny bundle (Svelte runtime ~8KB vs Next.js ~90KB first load JS), fast load, SSR at edge. Perfect for iframe embedding (offerwall)

---

## Repository Structure

```
moolah/
├── apps/
│   ├── offerwall/              # SvelteKit - iframe embed (Cloudflare Pages)
│   ├── main/                   # SvelteKit - main site (Cloudflare Pages)
│   ├── admin/                  # SvelteKit - admin panel (Cloudflare Pages + Access)
│   ├── api/                    # Hono API (Cloudflare Workers)
│   └── workers/                # Queue consumers (Cloudflare Workers)
│
├── packages/
│   ├── common/                 # Generic utilities (browser-safe)
│   ├── common-svelte/          # Generic Svelte components
│   ├── core/                   # Infrastructure: RPC, i18n, configs (browser-safe)
│   ├── core-svelte/            # Domain Svelte components
│   ├── domain/                 # Business domain types and enums (browser-safe)
│   ├── database/               # Drizzle schemas (server-only)
│   ├── contract/               # Client API schemas (server-only)
│   └── contract-admin/         # Admin API schemas (server-only)
│
├── tooling/
│   ├── config-tailwind/        # Shared Tailwind CSS 4 config
│   ├── config-typescript/
│   ├── config-prettier/
│   └── config-eslint/
│
├── turbo.json
├── pnpm-workspace.yaml
└── CLAUDE.md
```

You may IGNORE all the files starting with \_backup. Do not read these.

---

## Package Architecture

Moolah uses a **layered package architecture** organized by two dimensions:

1. **Scope**: Generic (`common`) vs Domain-specific (`core`)
2. **Runtime**: Browser-safe vs Server-only (`-server`) vs Svelte (`-svelte`)

### Runtime Environments

```
┌─────────────────────────────────────────────────────────────────┐
│ BROWSER                                                         │
│   - Svelte components render here                               │
│   - Can import: common, core, domain, common-svelte, core-svelte│
│   - CANNOT import: *-server, database, contract                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP
┌─────────────────────────────────────────────────────────────────┐
│ SVELTEKIT SSR (Cloudflare Pages Worker)                         │
│   - +page.server.ts, +layout.server.ts                          │
│   - Can import: ALL packages                                    │
│   - Calls API via service bindings                              │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Service Binding
┌─────────────────────────────────────────────────────────────────┐
│ API WORKER (Cloudflare Workers)                                 │
│   - Hono routes, RPC handlers, services                         │
│   - Can import: ALL packages except *-svelte                    │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Cloudflare Queues
┌─────────────────────────────────────────────────────────────────┐
│ BACKGROUND WORKERS (Cloudflare Workers)                         │
│   - Queue consumers: postback validation, fraud, settlement     │
│   - Can import: ALL packages except *-svelte                    │
│   - Async with retries and fault tolerance                      │
└─────────────────────────────────────────────────────────────────┘
```

### Package Matrix

| Package          | Scope   | Runtime          | Description                     |
| ---------------- | ------- | ---------------- | ------------------------------- |
| `common`         | Generic | Browser + Server | Utilities, types, guards        |
| `common-svelte`  | Generic | Browser + SSR    | UI components (Button, Card)    |
| `core`           | Infra   | Browser + Server | RPC types, i18n, configs        |
| `domain`         | Domain  | Browser + Server | Business types, enums, schemas  |
| `core-svelte`    | Domain  | Browser + SSR    | OfferCard, UserProfile          |
| `database`       | Domain  | Server only      | Drizzle schemas (Neon Postgres) |
| `contract`       | Domain  | Server only      | Client API schemas              |
| `contract-admin` | Domain  | Server only      | Admin API schemas               |

### Why This Structure?

**Generic vs Infrastructure vs Domain (`common` vs `core` vs `domain`)**

- `common` packages could be copied to any project - no business logic
- `core` is infrastructure - RPC machinery, i18n, configs, error handling
- `domain` is business entities - Offer, User, Publisher types and enums

**Browser-safe vs Server-only (`-server` suffix)**

- Browser-safe packages run everywhere - no secrets, no Node APIs
- Server-only packages use secrets, crypto, or server-specific code
- The `-server` suffix makes it clear: "this never runs in browser"

**Svelte packages (`-svelte` suffix)**

- Contain `.svelte` components and Svelte-specific utilities
- Can run in browser AND SvelteKit SSR (SSR is still server-side)

### Dependency Flow

```
common ──────────────────────────────────────────────────────────┐
  │                                                              │
  ├─→ core ─────────────────────────────────────────────────────┼┐
  │    │                                                        ││
  │    └─→ domain ──────────────────────────────────────────────┼┤
  │         │                                                   ││
  │         ├─→ database ───────────────────────────────────────┤├─→ apps/workers
  │         │                                                   ││
  │         ├─→ contract ───────────────────────────────────────┼┼─→ apps/api
  │         │                                                   ││
  │         └─→ contract-admin ─────────────────────────────────┘│
  │                                                              │
  ├─→ common-svelte                                              │
  │    │                                                         │
  │    └─→ core-svelte ──────────────────────────────────────────┴─→ apps/offerwall
  │                                                                  apps/main
  │                                                                  apps/admin
```

### Package Details

**@moolah/common** (browser-safe)

- Type guards, generic utilities
- No workspace dependencies

**@moolah/core** (browser-safe)

- RPC types (`RpcResult`, `RpcErrorCode`, `httpStatus` map)
- RPC helpers (`ok`, `isOk`, `isErr`)
- i18n locale definitions
- Project configs
- Depends on: `common`

**@moolah/domain** (browser-safe)

- Business types (`Offer`, `User`, `Publisher`, `Completion`)
- Enums (`OfferStatus`, `UserRole`, `CompletionStatus`)
- Domain schemas and constants
- Depends on: `common`, `core`

**@moolah/database** (server-only)

- Drizzle table schemas for Neon Postgres
- Depends on: `domain`

**@moolah/contract** (server-only)

- Client API input/output schemas
- Used by SvelteKit SSR and API
- Depends on: `core`, `domain`

**@moolah/contract-admin** (server-only)

- Admin API schemas (mutations, moderation)
- Depends on: `core`, `domain`, `contract`

**@moolah/common-svelte** (browser + SSR)

- Generic UI components (Button, Badge, Card)
- No workspace dependencies

**@moolah/core-svelte** (browser + SSR)

- Domain components (OfferCard, UserProfile)
- Depends on: `common-svelte`, `domain`

---

## Apps

### apps/offerwall (Cloudflare Pages)

Embeddable offerwall served via iframe. Optimized for minimal bundle size (~8KB Svelte runtime). Users browse and complete offers here.

### apps/main (Cloudflare Pages)

Main marketing site and user dashboard. Shared component library with other SvelteKit apps. SSR at edge.

### apps/admin (Cloudflare Pages + Cloudflare Access)

Admin panel for managing offers, publishers, users, and reviewing completions. Protected behind Cloudflare Access for authentication.

### apps/api (Cloudflare Workers)

Hono-based API handling all business logic. Handles postback ingestion at the edge. Publishes to Cloudflare Queues for async processing.

### apps/workers (Cloudflare Workers)

Queue consumers for background processing:

- **Postback validation** - Verify postback signatures and parameters
- **Fraud checks** - Detect duplicate completions, suspicious patterns
- **Balance settlement** - Credit user balances with retries and fault tolerance

All processing is async with automatic retries via Cloudflare Queues.

---

## Database (Neon Postgres)

Moolah uses **Neon Postgres serverless** instead of Cloudflare D1 because the workload is write-heavy (offer completions, balance updates, postback processing). Neon provides:

- Real ACID transactions
- Row-level locking for balance operations
- Serverless HTTP driver compatible with Cloudflare Workers
- Connection pooling via Neon's built-in proxy

### Drizzle + Neon Setup

```typescript
// packages/database/src/client.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export function createDb(databaseUrl: string) {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
}

export type DrizzleDb = ReturnType<typeof createDb>;
```

### Backend Request Context

```typescript
// apps/api/src/lib/request-context.ts
export interface RequestContext {
  db: DrizzleDb; // Drizzle instance (Neon Postgres)
  locale: string; // i18n locale from RPC context (for error messages)
}

export function createRequestContext(
  databaseUrl: string,
  rpcCtx: { locale?: string },
): RequestContext {
  return {
    db: createDb(databaseUrl),
    locale: rpcCtx.locale || "en",
  };
}
```

---

## RPC Architecture (Cloudflare Service Bindings)

Moolah uses **Cloudflare Service Bindings** for type-safe, low-latency communication between SvelteKit apps and the API worker.

### How It Works

**1. API Worker Exposes RPC Entrypoints**

```typescript
// apps/api/src/index.ts
export class ClientAPI extends WorkerEntrypoint<Env> {
  get offers() {
    return new OffersClientRpcTarget(this.env);
  }
  get users() {
    return new UsersRpcTarget(this.env);
  }
  get auth() {
    return new AuthRpcTarget(this.env);
  }
  get completions() {
    return new CompletionsRpcTarget(this.env);
  }
  get stats() {
    return new StatsRpcTarget(this.env);
  }
}

export class AdminAPI extends WorkerEntrypoint<Env> {
  get offers() {
    return new OffersAdminRpcTarget(this.env);
  }
  get publishers() {
    return new PublishersAdminRpcTarget(this.env);
  }
}
```

**2. SvelteKit Apps Bind to API**

```jsonc
// apps/main/wrangler.jsonc
{
  "services": [
    {
      "binding": "API",
      "service": "moolah-api",
      "entrypoint": "ClientAPI",
    },
  ],
}
```

**3. SvelteKit Calls RPC Methods**

```typescript
// apps/main/src/routes/offers/+page.server.ts
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform }) => {
  const offers = await platform!.env.API.offers.getOffers({
    locale: "en",
    page: 1,
    limit: 12,
  });

  return { offers };
};
```

### RPC Context Pattern

**Purpose:** Pass request-level metadata (locale, auth) as a separate parameter from business logic inputs.

**Client Request Context:**

```typescript
// @moolah/contract/src/context.ts
export const clientRequestContextSchema = v.object({
  locale: v.optional(v.enum(Locale), DEFAULT_LOCALE),
});
export type ClientRequestContext = v.InferOutput<
  typeof clientRequestContextSchema
>;
```

**Admin Request Context:**

```typescript
// @moolah/contract-admin/src/context.ts
export const adminRequestContextSchema = v.object({
  locale: v.optional(v.enum(Locale), DEFAULT_LOCALE),
  // Extensible: adminId, permissions, etc.
});
export type AdminRequestContext = v.InferOutput<
  typeof adminRequestContextSchema
>;
```

**Input Schema Pattern (Context Separate):**

Input schemas contain ONLY business logic parameters - no context:

```typescript
// @moolah/contract/src/offers/index.ts
export const getOffersInputSchema = v.object({
  category: v.optional(v.string()),
  page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
  limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(50)), 12),
});
export type GetOffersInput = v.InferOutput<typeof getOffersInputSchema>;
```

### RPC Handler Factory Pattern

The API uses a factory pattern (`createRpcHandler`) to automatically handle context creation, error translation, and tracing:

```typescript
// apps/api/src/lib/rpc.ts
import { ok, type RpcResult, type RpcFailure } from "@moolah/core/rpc";
import {
  ApiError,
  InternalError,
  isApiError,
  isInternalError,
} from "./errors/index.js";
import { getErrorMessage } from "./errors/messages.js";

export function createRpcHandler(env: Env) {
  return async function rpc<T>(
    rpcCtx: { id?: string; locale?: string },
    fn: (ctx: RequestContext) => Promise<T>,
    meta?: RpcMeta,
  ): Promise<RpcResult<T>> {
    const ctx = createRequestContext(env.DATABASE_URL, rpcCtx);
    try {
      const data = await fn(ctx);
      return ok(data, meta);
    } catch (error) {
      return toRpcFailure(error, ctx.locale);
    }
  };
}

function toRpcFailure(error: unknown, locale: string): RpcFailure {
  if (isApiError(error)) {
    return {
      ok: false,
      error: {
        code: error.code,
        message: getErrorMessage(error.code, locale, error.context),
        context: error.context ?? null,
        details: null,
      },
    };
  }
  if (isInternalError(error)) {
    console.error("[RPC] Internal error:", error.message, error.cause);
  } else {
    console.error("[RPC] Unexpected error:", error);
  }
  return {
    ok: false,
    error: {
      code: "SERVER_ERROR",
      message: getErrorMessage("SERVER_ERROR", locale),
      context: null,
      details: null,
    },
  };
}
```

**RPC Target Pattern (Using Handler Factory):**

```typescript
// apps/api/src/modules/offers/offers.client.rpc.ts
import type { ClientRequestContext } from "@moolah/contract/context";
import { createRpcHandler } from "@/lib/rpc";

export class OffersClientRpcTarget extends RpcTarget {
  private rpc: ReturnType<typeof createRpcHandler>;

  constructor(private env: Env) {
    super();
    this.rpc = createRpcHandler(env);
  }

  async getOffers(
    clientCtx: ClientRequestContext,
    input: GetOffersInput,
  ): Promise<RpcResult<GetOffersOutput>> {
    return this.rpc(clientCtx, async (ctx) => {
      return await offersService.getOffers(ctx, input);
    });
  }
}
```

**Service Layer Pattern:**

```typescript
// apps/api/src/modules/offers/offers.client.service.ts
export async function getOffers(
  ctx: RequestContext, // Injected context (has ctx.locale for errors, ctx.db for queries)
  input: GetOffersInput, // Business input
): Promise<GetOffersOutput> {
  const { category, page = 1, limit = 12 } = input;

  const offers = await ctx.db.query.offers.findMany({
    where: category ? eq(offers.category, category) : undefined,
    limit,
    offset: (page - 1) * limit,
  });

  return { offers, total, page };
}
```

**Call Sites (SvelteKit):**

```typescript
// apps/main/src/routes/offers/+page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  const locale = getLocale();

  const result = await locals.api.offers.getOffers(
    { locale }, // clientCtx - RPC metadata
    { page: 1, limit: 12 }, // input - business params
  );

  return { offers: result.offers };
};
```

**Benefits of this pattern:**

- **Clear separation** - RPC metadata (`clientCtx`) separate from business logic (`input`)
- **Client-side reusability** - Input schemas don't include backend-specific context
- **Clean naming** - `clientCtx` parameter -> `ctx` enriched context (no collision)
- **Dependency injection** - Database, locale, and future deps passed via context
- **Testability** - Easy to mock both `clientCtx` and `RequestContext`
- **Type safety** - Full type inference from contract to service layer

---

## SvelteKit App Structure (shared pattern for all SvelteKit apps)

```
apps/<app>/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                 # Base components (button, badge, card)
│   │   │   │   ├── button.svelte
│   │   │   │   ├── badge.svelte
│   │   │   │   └── index.ts
│   │   │   ├── layout/             # Header, footer, sidebar
│   │   │   │   ├── header.svelte
│   │   │   │   ├── footer.svelte
│   │   │   │   └── nav.svelte
│   │   │   └── offer-card.svelte   # Feature components
│   │   │
│   │   ├── server/                 # Server-only code
│   │   │   └── api.remote.ts       # Remote Functions
│   │   │
│   │   ├── schemas/                # Valibot schemas
│   │   │
│   │   ├── seo/                    # SEO utilities (per-page)
│   │   │   ├── common.ts           # Base SEO for all pages
│   │   │   └── types.ts            # SeoData type
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts               # Class merge
│   │   │   └── format.ts           # Formatting helpers
│   │   │
│   │   └── paraglide/              # Generated by Paraglide
│   │       ├── messages.js
│   │       ├── runtime.js
│   │       └── server.js
│   │
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +layout.server.ts
│   │   └── +page.svelte
│   │
│   ├── app.html
│   ├── app.css
│   ├── app.d.ts
│   ├── hooks.ts                    # Paraglide reroute
│   └── hooks.server.ts             # Paraglide middleware
│
├── messages/                       # i18n message files
│   ├── en.json
│   └── es.json
│
├── project.inlang/                 # Paraglide config
│   └── settings.json
│
├── static/
├── svelte.config.js
├── vite.config.ts
└── wrangler.jsonc
```

---

## Svelte 5 Syntax (REQUIRED)

Always use Svelte 5 Runes. Never use Svelte 4 syntax.

```svelte
<script lang="ts">
  // Props - use $props(), NOT export let
  let { offer, onSelect }: Props = $props()

  // State - use $state(), NOT let or writable()
  let count = $state(0)
  let offers = $state<Offer[]>([])

  // Derived - use $derived(), NOT $: reactive statements
  let doubled = $derived(count * 2)
  let filtered = $derived(offers.filter(o => o.payout > 100))

  // Effects - use $effect()
  $effect(() => {
    console.log('Count:', count)
    return () => console.log('Cleanup')
  })

  // Bindable props (two-way binding)
  let { value = $bindable('') } = $props()
</script>

<!-- Events: onclick, NOT on:click -->
<button onclick={() => count++}>Click</button>

<!-- Children: {@render}, NOT <slot /> -->
{@render children?.()}
```

### Never Use (Svelte 4)

```svelte
export let name;           // Use $props()
$: doubled = count * 2;    // Use $derived()
on:click={handler}         // Use onclick={handler}
<slot />                   // Use {@render children?.()}
class:active={isActive}    // Use class={[...]} or class={{...}}
```

---

## Props and Reactivity (CRITICAL)

**The `state_referenced_locally` warning** is one of the most important concepts in Svelte 5. It catches a common bug where you accidentally capture a prop's initial value instead of reacting to changes.

### The Problem

```svelte
<script lang="ts">
  let { user } = $props();
  // BUG: This captures the INITIAL value of user.name
  // If user prop changes, displayName stays stale!
  let displayName = $state(user.name);
</script>
```

**Why this matters in SvelteKit:** When navigating between routes like `/users/123` -> `/users/456`, SvelteKit **doesn't unmount** the component - it just updates the props. If you captured initial values, you'll display stale data from the previous user.

### The Fix: Use `$derived` or `$effect`

**Pattern 1: Read-only derived value**

```svelte
<script lang="ts">
  let { user } = $props();
  let displayName = $derived(user.name ?? "Anonymous");
</script>
```

**Pattern 2: Editable state that syncs with prop changes**

```svelte
<script lang="ts">
  let { user } = $props();
  let notesValue = $state("");

  $effect(() => {
    notesValue = user.adminNotes ?? "";
  });
</script>
```

**Pattern 3: Multiple values from data prop (SvelteKit pages)**

```svelte
<script lang="ts">
  let { data } = $props();
  const { products, offers, articles } = $derived(data);
</script>
```

### Decision Guide

Ask yourself: **"Should this value update when the prop changes?"**

| Answer          | Use                         | Example                            |
| --------------- | --------------------------- | ---------------------------------- |
| Yes, read-only  | `$derived()`                | Display name, computed values      |
| Yes, editable   | `$state()` + `$effect()`    | Form fields initialized from props |
| No, intentional | `$state()` + ignore warning | Truly one-time initialization      |

---

## Class Handling (Svelte 5.16+)

Svelte 5.16+ supports arrays and objects in the `class` attribute natively (uses clsx internally).
The `class:` directive is legacy — avoid it.

### Native Array Syntax (Preferred for Conditionals)

```svelte
<!-- Array: truthy values are combined -->
<div class={[
  "base-class",
  isActive && "bg-primary-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
]}>

<!-- Object: truthy keys are added -->
<div class={{ active: isActive, disabled: isDisabled }}>

<!-- Mixed: arrays can contain objects -->
<button class={["btn", props.class, { loading: isLoading }]}>
```

### Avoid `cn()` - Use Native Arrays

**IMPORTANT:** Prefer native `class={[...]}` arrays in almost all cases. The `cn()` helper uses `tailwind-merge` which has performance overhead. Only the developer should add `cn()` when absolutely necessary for class conflict resolution.

```svelte
<!-- PREFERRED: Native array (fast, no runtime overhead) -->
<div class={["px-2 py-2", props.class]}>

<!-- AVOID: cn() has tailwind-merge overhead -->
<div class={cn("px-2 py-2", props.class)}>
```

**AI should:**

- Always use native `class={[...]}` arrays
- Never add `cn()` unless explicitly requested
- Let the developer add `cn()` later if needed

### Type-Safe Class Props

```svelte
<script lang="ts">
  import type { ClassValue } from "svelte/elements"

  let { class: className }: { class?: ClassValue } = $props()
</script>

<div class={["base", className]}>...</div>
```

---

## Component Pattern (CVA)

```svelte
<!-- src/lib/components/ui/badge.svelte -->
<script lang="ts" module>
  import type { VariantProps } from 'cva'
  import { cva } from 'cva'

  export const badgeVariants = cva({
    base: 'inline-flex items-center justify-center font-medium',
    variants: {
      variant: {
        default: 'bg-surface-500 text-foreground',
        primary: 'bg-primary-500 text-white',
        success: 'bg-success/15 text-success',
        warning: 'bg-warning/15 text-warning',
        danger: 'bg-error/15 text-error',
      },
      size: {
        sm: 'h-5 rounded px-1.5 text-[10px]',
        md: 'h-6 rounded-md px-2 text-xs',
        lg: 'h-7 rounded-md px-2.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  })

  export type BadgeVariants = VariantProps<typeof badgeVariants>
</script>

<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'

  let {
    variant,
    size,
    class: className,
    children,
    ...restProps
  }: BadgeVariants & HTMLAttributes<HTMLSpanElement> & {
    children?: Snippet
  } = $props()
</script>

<span class={badgeVariants({ variant, size, className })} {...restProps}>
  {@render children?.()}
</span>
```

---

## SEO Pattern

Composable SEO data per page type.

### Types

```typescript
// src/lib/seo/types.ts
import type { Thing, WithContext } from "schema-dts";

export interface SeoData {
  title: string;
  description: string;
  canonicalUrl: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  twitterCard?: "summary" | "summary_large_image";
  twitterSite?: string;
  jsonLd?: WithContext<Thing>[];
  noindex?: boolean;
  nofollow?: boolean;
}
```

### SEO Component

```svelte
<!-- src/lib/components/seo.svelte -->
<script lang="ts">
  import type { SeoData } from '$lib/seo/types'

  let { data }: { data: SeoData } = $props()
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
  <link rel="canonical" href={data.canonicalUrl} />

  <meta property="og:title" content={data.ogTitle ?? data.title} />
  <meta property="og:description" content={data.ogDescription ?? data.description} />
  <meta property="og:url" content={data.canonicalUrl} />
  <meta property="og:type" content={data.ogType ?? 'website'} />
  {#if data.ogImage}
    <meta property="og:image" content={data.ogImage} />
  {/if}

  <meta name="twitter:card" content={data.twitterCard ?? 'summary_large_image'} />
  {#if data.twitterSite}
    <meta name="twitter:site" content={data.twitterSite} />
  {/if}

  {#if data.noindex || data.nofollow}
    <meta
      name="robots"
      content={[data.noindex && 'noindex', data.nofollow && 'nofollow']
        .filter(Boolean)
        .join(', ')}
    />
  {/if}

  {#if data.jsonLd}
    {#each data.jsonLd as item}
      {@html `<script type="application/ld+json">${JSON.stringify(item)}</script>`}
    {/each}
  {/if}
</svelte:head>
```

---

## Paraglide JS (i18n)

### Setup

```typescript
// vite.config.ts
import { sveltekit } from "@sveltejs/kit/vite";
import { paraglideVitePlugin } from "@inlang/paraglide-js";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit(),
    paraglideVitePlugin({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide",
      strategy: ["url", "cookie", "baseLocale"],
      disableAsyncLocalStorage: true, // Required for Cloudflare
    }),
  ],
});
```

```typescript
// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import { paraglideMiddleware } from "$lib/paraglide/server";

export const handle: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;
    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace("%lang%", locale),
    });
  });
```

```typescript
// src/hooks.ts (NOT hooks.server.ts)
import type { Reroute } from "@sveltejs/kit";
import { deLocalizeUrl } from "$lib/paraglide/runtime";

export const reroute: Reroute = (request) => {
  return deLocalizeUrl(request.url).pathname;
};
```

### Usage

```svelte
<script lang="ts">
  import * as m from '$lib/paraglide/messages'
</script>

<h1>{m.offers_title()}</h1>
<p>{m.payout_amount({ amount: offer.payout })}</p>
```

---

## Cloudflare Configuration

```typescript
// src/app.d.ts (SvelteKit apps)
declare global {
  namespace App {
    interface Platform {
      env: {
        API: Fetcher;
        KV: KVNamespace;
      };
    }
  }
}

export {};
```

```javascript
// svelte.config.js
import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};
```

```jsonc
// apps/main/wrangler.jsonc
{
  "name": "moolah-main",
  "compatibility_date": "2024-12-01",
  "pages_build_output_dir": ".svelte-kit/cloudflare",
  "services": [{ "binding": "API", "service": "moolah-api" }],
}
```

```jsonc
// apps/api/wrangler.jsonc (Workers env)
{
  "name": "moolah-api",
  "compatibility_date": "2024-12-01",
  "vars": {
    // DATABASE_URL set via wrangler secret
  },
  "queues": {
    "producers": [
      { "queue": "postback-processing", "binding": "POSTBACK_QUEUE" },
    ],
  },
}
```

---

## Tailwind CSS 4

```css
/* tooling/config-tailwind/src/colors.css */
@theme {
  --color-background: oklch(14.08% 0.004 285.82);
  --color-surface-600: oklch(17.76% 0.004 285.82);
  --color-surface-500: oklch(21.15% 0.006 285.82);
  --color-surface-400: oklch(27.47% 0.006 285.82);
  --color-foreground: oklch(87.61% 0.004 285.82);
  --color-foreground-emphasis: oklch(100% 0 0);
  --color-foreground-muted: oklch(70% 0.004 285.82);
  --color-primary-500: oklch(55.02% 0.238 275);
  --color-primary-400: oklch(60% 0.238 275);
  --color-success: oklch(70% 0.15 145);
  --color-warning: oklch(75% 0.15 85);
  --color-error: oklch(60% 0.2 25);
}
```

---

## Utilities

```typescript
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Commands

```bash
# Development
pnpm dev                          # All apps
pnpm --filter api dev             # API only
pnpm --filter main dev            # Main site with Wrangler (service bindings)
pnpm --filter offerwall dev       # Offerwall with Wrangler
pnpm --filter admin dev           # Admin panel with Wrangler
pnpm --filter main dev:vite       # Main site with Vite only (faster HMR, no RPC)

# Build & Deploy
pnpm build                        # Build all packages and apps
pnpm --filter main deploy         # Deploy main site to Cloudflare Pages
pnpm --filter offerwall deploy    # Deploy offerwall to Cloudflare Pages
pnpm --filter admin deploy        # Deploy admin to Cloudflare Pages
pnpm --filter api deploy          # Deploy API to Cloudflare Workers
pnpm --filter workers deploy      # Deploy background workers

# Database (Neon Postgres via Drizzle)
pnpm --filter api db:generate        # Generate migrations from schema
pnpm --filter api db:migrate         # Apply migrations
pnpm --filter api db:studio          # Open Drizzle Studio

# Type Generation
pnpm --filter api cf-typegen         # Generate Cloudflare binding types
pnpm --filter main cf-typegen        # Generate Cloudflare binding types
pnpm --filter offerwall cf-typegen   # Generate Cloudflare binding types
pnpm --filter admin cf-typegen       # Generate Cloudflare binding types
```

---

## Guidelines

### Always

- Use Svelte 5 Runes (`$state`, `$derived`, `$effect`, `$props`)
- Use `onclick`, not `on:click`
- Use `{@render children?.()}`, not `<slot />`
- Export CVA variants from `<script lang="ts" module>`
- Use `$lib/` for imports
- Use page-specific SEO functions (compose with base)
- Use Paraglide messages for all user-facing text
- Use `+page.server.ts` for SSR data loading
- Use Valibot for validation
- Use native `class={[...]}` for all class handling
- Use Neon Postgres serverless driver for database access
- Use Cloudflare Queues for async/background processing

### Never

- Use `cn()` (let developer add if needed for conflict resolution)
- Use Svelte 4 syntax
- Use `class:` directive (use `class={[...]}` instead)
- Use Zod (use Valibot)
- Use i18next or other runtime i18n (use Paraglide)
- Hardcode user-facing strings (use messages)
- Use `fs` module (Cloudflare doesn't support it)
- Use Cloudflare D1 (use Neon Postgres for transactional workloads)
