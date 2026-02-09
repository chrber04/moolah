# @moolah/contract

Client-facing API schemas for type-safe RPC communication.

## Runtime

**Server-only** - Used by SvelteKit SSR and API workers, never in browser.

## Contents

- **context** - `ClientRequestContext` (locale, request metadata)
- **offers** - Offer query schemas (`GetOffersInput`, `GetOfferInput`, `OfferPreview`)
- **users** - User query schemas (`GetUserProfileInput`, `UserProfile`, `GetBalanceInput`)
- **publishers** - Publisher query schemas (`GetPublisherInput`, `PublisherStats`)
- **completions** - Completion query schemas (`GetCompletionsInput`, `CompletionHistory`)
- **auth** - Auth schemas (`LoginInput`, `RegisterInput`, `Session`)
- **stats** - Stats schemas (`GetStatsInput`, `PlatformStats`)

## Usage

```ts
import type { ClientRequestContext } from "@moolah/contract/context";
import type { GetOffersInput, GetOffersOutput } from "@moolah/contract/offers";
import type { UserProfile } from "@moolah/contract/users";
```

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
- `@moolah/core` - RPC types and context schemas
- `@moolah/domain` - Domain types, enums, schemas
