# @moolah/database

Drizzle ORM schema definitions for Cloudflare D1.

## Runtime

**Server-only** - Used by API workers and migrations, never in browser.

## Contents

- **schema** - Drizzle table definitions (servers, users, blogPosts, etc.)
- **types** - Auto-inferred TypeScript types (Select & Insert variants)

## Usage

```ts
// Import tables and types
import { servers, users, blogPosts } from "@moolah/database";
import type { Server, User, BlogPost } from "@moolah/database";

// Import schema namespace for Drizzle client
import * as schema from "@moolah/database/schema";

const db = drizzle(d1, { schema });
```

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
- `@moolah/core` - Domain enums used in schema (`UserRole`, `ServerStatus`)
