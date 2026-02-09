# @moolah/common

Generic, project-agnostic utilities, types, and schemas.

## Runtime

**Browser-safe** - Runs in browser, SvelteKit SSR, and API workers.

## Contents

- **constants** - Standardized values (pagination sizes, limits, timeouts)
- **enums** - Common enumerations (sort direction, status codes)
- **guards** - Type guards and runtime validation helpers
- **schemas** - Valibot schemas for common data structures
- **types** - Shared TypeScript types (pagination, API responses)
- **utils** - Utility functions (date, string, validation helpers)

## Usage

```ts
import { isNonEmptyString } from "@moolah/common/guards";
import type { PaginatedResponse } from "@moolah/common/types";
```

## Workspace Dependencies

**None** - this is the foundation package with no workspace dependencies.
