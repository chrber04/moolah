# @moolah/contract-admin

Admin-facing API schemas for authenticated admin operations.

## Runtime

**Server-only** - Used by admin interfaces and API workers, never in browser.

## Contents

- **context** - `AdminRpcContext` (locale, admin metadata)
- **blog** - Blog mutation schemas (`CreatePostInput`, `UpdatePostInput`)
- **servers** - Server moderation schemas (`ApproveServerInput`, `BanServerInput`)
- **users** - User management schemas (`BanUserInput`, `UpdateUserRoleInput`)
- **emojis** - Emoji moderation schemas (`ApproveEmojiInput`, `DeleteEmojiInput`)
- **bots** - Bot moderation schemas (`ApproveBotInput`, `BanBotInput`)
- **reports** - Report handling schemas (`ResolveReportInput`, `DismissReportInput`)

## Usage

```ts
import type { CreatePostInput, MutationResult } from "@moolah/contract-admin/blog";
import type { AdminRpcContext } from "@moolah/contract-admin/context";
```

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
- `@moolah/core` - RPC types and context schemas
- `@moolah/domain` - Domain types, enums, schemas
- `@moolah/contract` - Shared base types
