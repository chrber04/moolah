# @moolah/database

Drizzle ORM schema definitions for Neon Postgres serverless.

## Runtime

**Server-only** - Used by API workers and migrations, never in browser.

## Contents

- **schema** - Drizzle table definitions (offers, users, publishers, completions, postbacks, etc.)
- **types** - Auto-inferred TypeScript types (Select & Insert variants)
- **client** - Database client factory (`createDb`)

## Usage

```ts
// Import tables and types
import { offers, users, publishers, completions } from "@moolah/database";
import type { Offer, User, Publisher, Completion } from "@moolah/database";

// Import schema namespace for Drizzle client
import * as schema from "@moolah/database/schema";
import { createDb } from "@moolah/database/client";

const db = createDb(env.DATABASE_URL);
```

## Database

Moolah uses **Neon Postgres serverless** instead of Cloudflare D1 because the workload is write-heavy (offer completions, balance updates, postback processing). Neon provides:

- Real ACID transactions
- Row-level locking for balance operations
- Serverless HTTP driver compatible with Cloudflare Workers
- Connection pooling via Neon's built-in proxy

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
- `@moolah/domain` - Domain enums used in schema (`OfferStatus`, `UserRole`, `CompletionStatus`)
