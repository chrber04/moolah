# @moolah/core-svelte

Domain-specific Svelte 5 components and utilities for Moolah.

## Runtime

**Browser + SSR** - Runs in browser and SvelteKit SSR.

## Contents

- **components** - Domain components (OfferCard, UserProfile, PublisherStats, CompletionHistory)
- **stores** - Svelte stores (user preferences, balance updates, theme)
- **utils** - Domain utilities (formatCurrency, formatPayout, formatCompletionRate)

## Usage

```ts
import { OfferCard } from "@moolah/core-svelte/components/offer-card";
import { UserProfile } from "@moolah/core-svelte/components/user-profile";
import { formatCurrency, formatPayout } from "@moolah/core-svelte/utils";
```

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
- `@moolah/common-svelte` - Generic Svelte components
- `@moolah/domain` - Domain types and enums
