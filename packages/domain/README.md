# @moolah/domain

Business domain types and enums for Moolah.

## Purpose

This package contains the **domain layer** - types that define "what things are" in the business domain:

- **Blog**: Post statuses, locales, categories, and types
- **Server**: Visibility, premium tiers, badges, and types
- **User**: Roles and profile types
- **Auth**: Session data and device info types
- **Report**: Report types and statuses
- **Bot**: Bot listing types
- **Emoji**: Emoji pack types
- **Review**: Review and stats types

## Usage

```typescript
import type { BlogPostBase } from "@moolah/domain/blog";
import type { ServerBadge } from "@moolah/domain/server";
import type { User } from "@moolah/domain/user";
import { BlogPostStatus } from "@moolah/domain/blog";
import { ServerVisibility } from "@moolah/domain/server";
import { UserRole } from "@moolah/domain/user";
```

## Architecture

This package is part of the layered architecture:

```
common → core → domain → contract/contract-admin/database → apps
```

- **common**: Base utilities (no dependencies)
- **core**: Infrastructure (configs, i18n, cookies)
- **domain**: Business entities (this package)
- **contract**: API contracts (depends on domain)
- **database**: Database schemas (depends on domain)
