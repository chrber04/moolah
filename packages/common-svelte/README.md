# @moolah/common-svelte

Generic, project-agnostic Svelte 5 components and utilities.

## Runtime

**Browser + SSR** - Runs in browser and SvelteKit SSR.

## Contents

- **components** - UI components (Button, Badge, Card, Input, etc.)
- **utils** - Svelte utilities (`cn` for class merging)
- **types** - Component types (`WithChildren`, `WithElementRef`)

## Usage

```ts
import { Button, buttonVariants } from "@moolah/common-svelte/components/button";
import { Card, CardContent, CardHeader } from "@moolah/common-svelte/components/card";
import { cn } from "@moolah/common-svelte/utils";
import type { WithElementRef } from "@moolah/common-svelte/types";
```

## External Dependencies

- `bits-ui` - Headless UI primitives
- `clsx` - Class name utility
- `cva` - Class variance authority

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
