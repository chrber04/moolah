# Moolah

Online platform for micro jobs and offerwalls. Workers earn money completing tasks, employers post micro jobs, and publishers embed the offerwall to monetize their audience.

## Tech Stack

**Frontend:** SvelteKit 2 + Svelte 5, Tailwind CSS 4, Bits UI
**API:** Hono on Cloudflare Workers
**Database:** Neon Postgres serverless + Drizzle ORM
**Hosting:** Cloudflare Pages + Workers
**Monorepo:** Turborepo + PNPM

## What's inside?

### Apps

- `web-offerwall` - SvelteKit iframe embed (~8KB bundle) deployed to Cloudflare Pages
- `web` - Main marketing site and user dashboard (SvelteKit) deployed to Cloudflare Pages
- `web-admin` - Admin panel protected by Cloudflare Access (SvelteKit) deployed to Cloudflare Pages
- `api` - Hono API handling business logic and postback ingestion (Cloudflare Workers)
- `workers` - Background queue consumers for postback validation, fraud checks, balance settlement (Cloudflare Workers)

### Packages

- `@moolah/common` - Generic utilities (browser-safe)
- `@moolah/common-svelte` - Generic Svelte UI components (Button, Badge, Card)
- `@moolah/core` - Infrastructure: RPC types, i18n, configs (browser-safe)
- `@moolah/core-svelte` - Domain Svelte components (OfferCard, UserProfile)
- `@moolah/domain` - Business types and enums (browser-safe)
- `@moolah/database` - Drizzle schemas for Neon Postgres (server-only)
- `@moolah/contract` - Client API schemas (server-only)
- `@moolah/contract-admin` - Admin API schemas (server-only)

### Tooling

- `config-tailwind` - Shared Tailwind CSS 4 configuration
- `config-typescript` - Shared TypeScript configs
- `config-prettier` - Shared Prettier config
- `config-eslint` - Shared ESLint config

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9+
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) for Cloudflare deployments

### Install Dependencies

```bash
pnpm install
```

### Development

Run all apps in development mode:

```bash
pnpm dev
```

Run specific apps:

```bash
# API only
pnpm --filter api dev

# Main site with Wrangler (service bindings enabled)
pnpm --filter web dev

# Main site with Vite only (faster HMR, no RPC)
pnpm --filter web dev:vite

# Offerwall
pnpm --filter web-offerwall dev

# Admin panel
pnpm --filter web-admin dev
```

### Build

Build all apps and packages:

```bash
pnpm build
```

Build specific apps:

```bash
pnpm --filter web build
pnpm --filter api build
```

### Database

Moolah uses Neon Postgres serverless via Drizzle ORM:

```bash
# Generate migrations from schema changes
pnpm --filter api db:generate

# Apply migrations
pnpm --filter api db:migrate

# Open Drizzle Studio
pnpm --filter api db:studio
```

### Deployment

Deploy to Cloudflare:

```bash
# Deploy all apps
pnpm deploy

# Deploy specific apps
pnpm --filter web deploy             # Cloudflare Pages
pnpm --filter web-offerwall deploy   # Cloudflare Pages
pnpm --filter web-admin deploy       # Cloudflare Pages
pnpm --filter api deploy             # Cloudflare Workers
pnpm --filter workers deploy         # Cloudflare Workers
```

### Type Generation

Generate Cloudflare binding types:

```bash
pnpm --filter api cf-typegen
pnpm --filter web cf-typegen
pnpm --filter web-offerwall cf-typegen
pnpm --filter web-admin cf-typegen
```

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ CLOUDFLARE PAGES (Edge SSR)                                  │
│  - apps/web, apps/web-offerwall, apps/web-admin              │
└──────────────────┬───────────────────────────────────────────┘
                   │ Service Bindings
┌──────────────────▼───────────────────────────────────────────┐
│ CLOUDFLARE WORKERS                                           │
│  - apps/api (Hono API)                                       │
│  - apps/workers (Queue consumers)                            │
└──────────────────┬───────────────────────────────────────────┘
                   │ HTTP (serverless driver)
┌──────────────────▼───────────────────────────────────────────┐
│ NEON POSTGRES (Serverless)                                   │
│  - Real transactions, row-level locking                      │
└──────────────────────────────────────────────────────────────┘
```

**Why this stack:**

- **Cloudflare for all compute + caching** - Edge SSR, Workers, Queues, KV
- **Neon Postgres for transactional data** - D1 not suitable for write-heavy workloads (offers, completions, balances)
- **SvelteKit for all frontends** - Tiny bundle (~8KB runtime vs ~90KB Next.js), fast SSR at edge

## Documentation

For detailed architecture and development guidelines, see [CLAUDE.md](./CLAUDE.md).

## Useful Links

Learn more about the technologies used:

- [SvelteKit](https://kit.svelte.dev/) - Frontend framework
- [Svelte 5](https://svelte.dev/) - UI framework with runes
- [Cloudflare Pages](https://pages.cloudflare.com/) - Edge hosting
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless compute
- [Hono](https://hono.dev/) - Fast web framework
- [Neon](https://neon.tech/) - Serverless Postgres
- [Drizzle](https://orm.drizzle.team/) - TypeScript ORM
- [Turborepo](https://turborepo.com/) - Monorepo build system
