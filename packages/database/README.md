# @moolah/database

Drizzle ORM schema definitions for Neon Postgres serverless.

## Runtime

**Server-only** - Used by API workers and migrations, never in browser.

## Contents

- **schema** - Drizzle table definitions (offers, surveys, publishers, completions, callbacks, etc.)
- **types** - Auto-inferred TypeScript types (Select & Insert variants)
- **client** - Database client factory (`createDb`)

## Usage

```ts
// Import tables and types
import type { Completion, Offer, Publisher, User } from "@moolah/database";
import { completions, offers, publishers, users } from "@moolah/database";
import { createDb } from "@moolah/database/client";
// Import schema namespace for Drizzle client
import * as schema from "@moolah/database/schema";

const db = createDb(env.DATABASE_URL);
```

## Database

Moolah uses **Neon Postgres serverless** instead of Cloudflare D1 because the workload is write-heavy (offer completions, balance updates, callback processing). Neon provides:

- Real ACID transactions
- Row-level locking for balance operations
- Serverless HTTP driver compatible with Cloudflare Workers
- Connection pooling via Neon's built-in proxy

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
- `@moolah/domain` - Domain enums used in schema (`OfferStatus`, `UserRole`, `CompletionStatus`)
