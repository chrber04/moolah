# @moolah/contract-admin

Admin-facing API schemas for authenticated admin operations.

## Runtime

**Server-only** - Used by admin interfaces and API workers, never in browser.

## Contents

- **context** - `AdminRequestContext` (locale, admin metadata)
- **offers** - Offer management schemas (`CreateOfferInput`, `UpdateOfferInput`, `DeleteOfferInput`)
- **users** - User moderation schemas (`BanUserInput`, `UpdateUserRoleInput`, `AdjustBalanceInput`)
- **publishers** - Publisher management schemas (`ApprovePublisherInput`, `UpdatePublisherInput`)
- **completions** - Completion review schemas (`ApproveCompletionInput`, `RejectCompletionInput`)
- **postbacks** - Postback monitoring schemas (`GetPostbackLogsInput`, `RetryPostbackInput`)
- **stats** - Admin stats schemas (`GetAdminStatsInput`, `RevenueReportInput`)

## Usage

```ts
import type { CreateOfferInput, UpdateOfferInput } from "@moolah/contract-admin/offers";
import type { AdminRequestContext } from "@moolah/contract-admin/context";
import type { BanUserInput } from "@moolah/contract-admin/users";
```

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
- `@moolah/core` - RPC types and context schemas
- `@moolah/domain` - Domain types, enums, schemas
- `@moolah/contract` - Shared base types
