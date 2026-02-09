# @moolah/contract

Client-facing API schemas for type-safe RPC communication.

## Runtime

**Server-only** - Used by SvelteKit SSR and API workers, never in browser.

## Contents

- **context** - `ClientRpcContext` (locale, request metadata)
- **blog** - Blog query schemas (`GetPostsInput`, `BlogPostPreview`)
- **servers** - Server query schemas (`GetServersInput`, `ServerPreview`)
- **users** - User query schemas (`GetUserInput`, `UserProfile`)
- **emojis** - Emoji query schemas (`GetEmojisInput`, `EmojiPreview`)
- **bots** - Bot query schemas (`GetBotsInput`, `BotPreview`)
- **auth** - Auth schemas (`GetCurrentUserInput`, `Session`)
- **stats** - Stats schemas (`GetGlobalStatsInput`)

## Usage

```ts
import type { GetPostsInput, GetPostsOutput } from "@moolah/contract/blog";
import type { ClientRpcContext } from "@moolah/contract/context";
```

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
- `@moolah/core` - RPC types and context schemas
- `@moolah/domain` - Domain types, enums, schemas
