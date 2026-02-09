# @moolah/core

Infrastructure utilities for Moolah: RPC types, i18n, configs.

## Runtime

**Browser-safe** - Runs in browser, SvelteKit SSR, and API workers.

## Contents

- **configs** - Project configuration (branding, URLs, SEO defaults)
- **constants** - Infrastructure constants (limits, timeouts)
- **enums** - Infrastructure enums (`CookieName`, `ClientCookieName`)
- **i18n** - Locale definitions and helpers
- **rpc** - RPC result types (`RpcResult`, `RpcErrorCode`, `httpStatus`, `ok`, `isOk`, `isErr`)
- **schemas** - Infrastructure Valibot schemas
- **types** - Infrastructure types
- **utils** - Utility functions

## Usage

```ts
import { projectConfig } from "@moolah/core/configs";
import { CookieName, ClientCookieName } from "@moolah/core/enums";
import { ok, isOk, isErr, type RpcResult, type RpcErrorCode } from "@moolah/core/rpc";
import { Locale } from "@moolah/core/i18n";
```

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
