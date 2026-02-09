# @moolah/core-svelte

Domain-specific Svelte 5 components and utilities for Moolah.

## Runtime

**Browser + SSR** - Runs in browser and SvelteKit SSR.

## Contents

- **components** - Domain components (ServerCard, UserProfile, EmojiGrid)
- **stores** - Svelte stores (user preferences, theme)
- **utils** - Domain utilities (formatMemberCount, formatTimestamp)

## Usage

```ts
import { ServerCard } from "@moolah/core-svelte/components/server-card";
import { formatMemberCount } from "@moolah/core-svelte/utils";
```

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
- `@moolah/common-svelte` - Generic Svelte components
- `@moolah/core` - Domain types and enums
