# @moolah/domain

Business domain types and enums for Moolah.

## Runtime

**Browser-safe** - Runs in browser, SvelteKit SSR, and API workers.

## Purpose

This package contains the **domain layer** - types that define "what things are" in the business domain:

- **Offer**: Offerwall content, categories, payout types, status
- **User**: Worker profiles, roles, balance, completion history
- **Publisher**: Publisher accounts, iframe embedding, revenue tracking
- **Completion**: Offer completion tracking, status, validation
- **Postback**: Advertiser callbacks, signature validation, parameters
- **Stats**: Platform statistics, aggregated metrics

## Usage

```typescript
import type { Offer, OfferCategory } from "@moolah/domain/offer";
import type { User, UserRole } from "@moolah/domain/user";
import type { Publisher } from "@moolah/domain/publisher";
import type { Completion, CompletionStatus } from "@moolah/domain/completion";
import { OfferStatus } from "@moolah/domain/offer";
import { UserRole } from "@moolah/domain/user";
```

## Architecture

This package is part of the layered architecture:

```
common → core → domain → contract/contract-admin/database → apps
```

- **common**: Base utilities (no dependencies)
- **core**: Infrastructure (configs, i18n, RPC types)
- **domain**: Business entities (this package)
- **contract**: API contracts (depends on domain)
- **database**: Database schemas (depends on domain)

## Workspace Dependencies

- `@moolah/common` - Generic isomorphic utilities
- `@moolah/core` - Infrastructure types and RPC
