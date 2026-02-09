# API Architecture Guide

Comprehensive documentation for the Moolah API patterns, conventions, and code quality standards.

---

## Table of Contents

1. [Package Structure](#package-structure)
2. [Contract Packages](#contract-packages)
3. [RPC Architecture](#rpc-architecture)
4. [Service Layer](#service-layer)
5. [Transformers (DTOs)](#transformers-dtos)
6. [Request Context](#request-context)
7. [Exception Handling](#exception-handling)
8. [Valibot Schemas](#valibot-schemas)
9. [Naming Conventions](#naming-conventions)
10. [File Structure per Module](#file-structure-per-module)
11. [Code Quality Checklist](#code-quality-checklist)

---

## Package Structure

```
packages/
├── contract/              # Client-facing API schemas
│   └── src/
│       ├── context.ts     # ClientRequestContext
│       └── {module}/
│           ├── index.ts
│           └── schemas/
│               ├── index.ts
│               ├── common.ts          # Shared DTOs
│               ├── get-{thing}.ts     # Per-endpoint schemas
│               └── update-{thing}.ts
│
├── contract-admin/        # Admin-facing API schemas
│   └── src/
│       ├── context.ts     # AdminRequestContext
│       └── {module}/
│           └── schemas/   # Same structure as contract
│
└── common/
    └── src/
        └── schemas/       # Reusable validation schemas
            ├── strings/   # displayNameSchema, emailSchema, etc.
            ├── numbers/   # positiveIntSchema, etc.
            └── enums/     # orderDirectionSchema, etc.
```

---

## Contract Packages

### Philosophy

- **One file per endpoint** in `schemas/` folder
- **Shared DTOs** in `common.ts`
- **All types include "Dto" suffix** for clarity
- **Schemas are the source of truth** for API types

### Schema File Structure

```typescript
// packages/contract-admin/src/user/schemas/common.ts
import * as v from "valibot";
import { UserRole } from "@moolah/domain/user";

/** Row DTO for list views - minimal fields */
export const adminUserRowDtoSchema = v.object({
  id: v.string(),
  discordId: v.string(),
  role: v.enum(UserRole),
  displayName: v.string(),
  avatarUrl: v.nullable(v.string()),
  createdAt: v.date(),
  deletedAt: v.nullable(v.date())
});
export type AdminUserRowDto = v.InferOutput<typeof adminUserRowDtoSchema>;

/** Detail DTO for single-item views - full fields */
export const adminUserDetailDtoSchema = v.object({
  ...adminUserRowDtoSchema.entries,
  email: v.nullable(v.string()),
  emailIsVerified: v.boolean(),
  // ... additional fields
});
export type AdminUserDetailDto = v.InferOutput<typeof adminUserDetailDtoSchema>;

/** Mutation result DTO */
export const adminMutationResultDtoSchema = v.object({
  success: v.boolean(),
  id: v.string()
});
export type AdminMutationResultDto = v.InferOutput<typeof adminMutationResultDtoSchema>;
```

### Per-Endpoint Schema Files

```typescript
// packages/contract-admin/src/user/schemas/get-user.ts
import * as v from "valibot";
import { adminUserDetailDtoSchema } from "./common.js";

export const adminGetUserInputSchema = v.object({
  userId: v.string()
});
export type AdminGetUserInput = v.InferOutput<typeof adminGetUserInputSchema>;

export const adminGetUserOutputSchema = adminUserDetailDtoSchema;
export type AdminGetUserOutput = v.InferOutput<typeof adminGetUserOutputSchema>;
```

### Index Exports

```typescript
// packages/contract-admin/src/user/schemas/index.ts
export * from "./common.js";
export * from "./get-user.js";
export * from "./get-users.js";
export * from "./update-user-role.js";
export * from "./ban-user.js";
export * from "./unban-user.js";

// packages/contract-admin/src/user/index.ts
export * from "./schemas/index.js";
```

---

## RPC Architecture

### RPC Target Pattern

```typescript
// apps/api/src/modules/{module}/{module}.admin.rpc.ts
import type { Env } from "$env";
import { RpcTarget } from "cloudflare:workers";

import type { AdminRequestContext } from "@moolah/contract-admin/context";
import type {
  AdminGetUserInput,
  AdminGetUserOutput,
  AdminMutationResultDto
} from "@moolah/contract-admin/user";
import type { RpcResult } from "@moolah/core/rpc";

import { createRpcHandler } from "$lib/rpc";

import * as userAdminService from "./user.admin.service";

export class UsersAdminRpcTarget extends RpcTarget {
  private rpc: ReturnType<typeof createRpcHandler>;

  constructor(env: Env) {
    super();
    this.rpc = createRpcHandler(env);
  }

  async getUser(
    ctx: AdminRequestContext,
    input: AdminGetUserInput
  ): Promise<RpcResult<AdminGetUserOutput>> {
    return this.rpc(ctx, (c) => userAdminService.getUser(c, input));
  }

  async banUser(
    ctx: AdminRequestContext,
    input: AdminBanUserInput
  ): Promise<RpcResult<AdminMutationResultDto>> {
    return this.rpc(ctx, (c) => userAdminService.banUser(c, input));
  }
}
```

### RPC Handler Factory

The `createRpcHandler` function:
- Creates `RequestContext` with DB and locale
- Wraps service calls in try/catch
- Converts `HttpException` → `RpcFailure` with i18n messages
- Logs `InternalException` but returns generic error to client

```typescript
// apps/api/src/lib/rpc.ts
export function createRpcHandler(env: Env) {
  return async function rpc<T>(
    rpcCtx: { locale?: string },
    fn: (ctx: RequestContext) => Promise<T>
  ): Promise<RpcResult<T>> {
    const ctx = createRequestContext(env.DB, rpcCtx);
    try {
      const data = await fn(ctx);
      return ok(data);
    } catch (error) {
      return toRpcFailure(error, ctx.locale);
    }
  };
}
```

---

## Service Layer

### Functional Style

Services are **pure functions**, not classes. They receive `RequestContext` and typed input.

```typescript
// apps/api/src/modules/user/user.admin.service.ts
import { eq } from "drizzle-orm";

import type {
  AdminGetUserInput,
  AdminGetUserOutput,
  AdminBanUserInput,
  AdminMutationResultDto
} from "@moolah/contract-admin/user";
import { users } from "@moolah/database";

import type { RequestContext } from "$lib/context";
import { NotFoundException } from "$lib/exceptions/http.exception";

import { toAdminUserDetailDto } from "./user.transformer";

// -------------------------------------
// Service Functions
// -------------------------------------

export async function getUser(
  ctx: RequestContext,
  input: AdminGetUserInput
): Promise<AdminGetUserOutput> {
  const { userId } = input;

  const user = await ctx.db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (!user) {
    throw new NotFoundException();
  }

  return toAdminUserDetailDto(user);
}

export async function banUser(
  ctx: RequestContext,
  input: AdminBanUserInput
): Promise<AdminMutationResultDto> {
  const { userId, reason } = input;

  const user = await ctx.db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { id: true }
  });

  if (!user) {
    throw new NotFoundException();
  }

  await ctx.db
    .update(users)
    .set({ bannedAt: new Date(), banReason: reason, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return { success: true, id: userId };
}
```

### Service Guidelines

1. **One function per operation** - Keep functions focused
2. **Validate existence early** - Check if resource exists before mutating
3. **Use transformers** - Never return raw DB records
4. **Throw HttpException** - For client-facing errors
5. **Throw InternalException** - For unexpected errors (logged, not exposed)

---

## Transformers (DTOs)

### Purpose

Transform database records into API response objects. This:
- Decouples DB schema from API contract
- Ensures consistent field mapping
- Makes it explicit what data leaves the system

### File Structure

```typescript
// apps/api/src/modules/user/user.transformer.ts
import type { AdminUserRowDto, AdminUserDetailDto } from "@moolah/contract-admin/user";
import type { users } from "@moolah/database";

type DbUser = typeof users.$inferSelect;

// -------------------------------------
// Row DTOs (for list views)
// -------------------------------------

export function toAdminUserRowDto(user: DbUser): AdminUserRowDto {
  return {
    id: user.id,
    discordId: user.discordId,
    role: user.role,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    deletedAt: user.deletedAt
  };
}

// -------------------------------------
// Detail DTOs (for single-item views)
// -------------------------------------

export function toAdminUserDetailDto(user: DbUser): AdminUserDetailDto {
  return {
    ...toAdminUserRowDto(user),
    email: user.email,
    emailIsVerified: user.emailIsVerified,
    wantsProfilePublic: user.wantsProfilePublic,
    wantsMarketingEmails: user.wantsMarketingEmails,
    wantsServiceEmails: user.wantsServiceEmails,
    acceptsEssentialCookies: user.acceptsEssentialCookies,
    acceptsPerformanceCookies: user.acceptsPerformanceCookies,
    acceptsFunctionalCookies: user.acceptsFunctionalCookies,
    acceptsAdvertisingCookies: user.acceptsAdvertisingCookies,
    acceptsAnalyticsCookies: user.acceptsAnalyticsCookies,
    updatedAt: user.updatedAt
  };
}
```

### Transformer Guidelines

1. **Naming**: `to{DtoName}` (e.g., `toAdminUserRowDto`)
2. **Return type annotation**: Always specify the DTO type
3. **Compose when possible**: Detail DTO can spread Row DTO
4. **No validation needed**: DB is trusted source, TypeScript catches mismatches
5. **Keep in separate file**: `{module}.transformer.ts`

---

## Request Context

### Definition

```typescript
// apps/api/src/lib/context.ts
import type { DrizzleDb } from "@moolah/database";

export interface RequestContext {
  db: DrizzleDb;
  locale: string;
}
```

### Creation

```typescript
// apps/api/src/lib/context.ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@moolah/database";
import { DEFAULT_LOCALE } from "@moolah/core/i18n";

export function createRequestContext(
  database: D1Database,
  rpcCtx: { locale?: string }
): RequestContext {
  return {
    db: drizzle(database, { schema }),
    locale: rpcCtx.locale ?? DEFAULT_LOCALE
  };
}
```

### Usage

- **ctx.db**: Database queries
- **ctx.locale**: Error message translation

---

## Exception Handling

### Two-Tier Exception System

```
┌─────────────────────────────────────────────────────────────────┐
│ HttpException (Client-Facing)                                   │
│ - Has messageKey for i18n translation                           │
│ - Becomes RpcFailure with translated message                    │
│ - Examples: NotFoundException, BadRequestException              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ InternalException (Server-Side)                                 │
│ - Logged with full details                                      │
│ - Returns generic "SERVER_ERROR" to client                      │
│ - Examples: DatabaseException, ExternalApiException             │
└─────────────────────────────────────────────────────────────────┘
```

### HttpException Usage

```typescript
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from "$lib/exceptions/http.exception";

// Simple - uses default message key
throw new NotFoundException();

// With custom message key
throw new BadRequestException({
  messageKey: "exception_invalidDisplayName"
});

// With interpolation context
throw new BadRequestException({
  messageKey: "exception_fieldTooLong",
  context: { field: "displayName", max: 32 }
});
```

### Message Keys

```typescript
// Format: exception_{errorType}
// Examples:
"exception_notFound"           // Resource not found
"exception_badRequest"         // Invalid input
"exception_unauthorized"       // Not logged in
"exception_forbidden"          // No permission
"exception_conflict"           // Resource already exists
"exception_invalidDisplayName" // Specific validation error
```

---

## Valibot Schemas

### Reusable Schemas in @moolah/common

```typescript
// packages/common/src/schemas/strings/display-name.schema.ts
import * as v from "valibot";
import { DISPLAY_NAME_MIN_LENGTH, DISPLAY_NAME_MAX_LENGTH } from "../../constants/display-name.constant.js";

export const displayNameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(DISPLAY_NAME_MIN_LENGTH),
  v.maxLength(DISPLAY_NAME_MAX_LENGTH)
);
```

### Using in Contracts

```typescript
// packages/contract/src/current-user/schemas/update-display-name.ts
import * as v from "valibot";
import { displayNameSchema } from "@moolah/common/schemas";

export const updateCurrentUserDisplayNameInputSchema = v.object({
  userId: v.string(),
  displayName: displayNameSchema
});
export type UpdateCurrentUserDisplayNameInput = v.InferOutput<
  typeof updateCurrentUserDisplayNameInputSchema
>;
```

### Schema Conventions

1. **Suffix**: `{name}Schema` (e.g., `displayNameSchema`)
2. **Export type**: Always export inferred type alongside schema
3. **Pipe for validation**: Use `v.pipe()` for chained validations
4. **Constants**: Extract magic numbers to constants

---

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Client Service | `{module}.client.service.ts` | `servers.client.service.ts` |
| Admin Service | `{module}.admin.service.ts` | `servers.admin.service.ts` |
| Client RPC | `{module}.client.rpc.ts` | `servers.client.rpc.ts` |
| Admin RPC | `{module}.admin.rpc.ts` | `servers.admin.rpc.ts` |
| Transformer | `{module}.transformer.ts` | `servers.transformer.ts` |

### Types & Schemas

| Type | Pattern | Example |
|------|---------|---------|
| DTO Schema | `{context}{Entity}{View}DtoSchema` | `adminUserRowDtoSchema` |
| DTO Type | `{Context}{Entity}{View}Dto` | `AdminUserRowDto` |
| Input Schema | `{context}{Action}{Entity}InputSchema` | `adminGetUserInputSchema` |
| Input Type | `{Context}{Action}{Entity}Input` | `AdminGetUserInput` |
| Output Schema | `{context}{Action}{Entity}OutputSchema` | `adminGetUserOutputSchema` |
| Output Type | `{Context}{Action}{Entity}Output` | `AdminGetUserOutput` |

### Functions

| Type | Pattern | Example |
|------|---------|---------|
| Transformer | `to{DtoName}` | `toAdminUserRowDto` |
| Service (query) | `get{Entity}` / `get{Entities}` | `getUser`, `getUsers` |
| Service (mutation) | `{verb}{Entity}` | `banUser`, `updateUserRole` |
| RPC method | Same as service | `getUser`, `banUser` |

### i18n Message Keys

```
exception_{errorType}           # Error messages
exception_{specificError}       # Specific validation errors

# Examples:
exception_notFound
exception_badRequest
exception_invalidDisplayName
exception_fieldTooLong
```

---

## File Structure per Module

```
apps/api/src/modules/{module}/
├── {module}.client.service.ts    # Client-facing service functions
├── {module}.client.rpc.ts        # Client RPC target class
├── {module}.admin.service.ts     # Admin service functions
├── {module}.admin.rpc.ts         # Admin RPC target class
└── {module}.transformer.ts       # DB → DTO transformers (shared)
```

### Example: User Module

```
apps/api/src/modules/user/
├── user.client.service.ts        # getPublicProfile, etc.
├── user.client.rpc.ts            # UsersClientRpcTarget
├── user.admin.service.ts         # getUser, getUsers, banUser, etc.
├── user.admin.rpc.ts             # UsersAdminRpcTarget
└── user.transformer.ts           # toAdminUserRowDto, toAdminUserDetailDto, etc.
```

---

## Code Quality Checklist

### Before Committing

- [ ] **DTOs have "Dto" suffix** in both schema and type names
- [ ] **Transformers exist** for all DB → API conversions
- [ ] **Service functions are pure** - receive ctx and input, return output
- [ ] **HttpException used** for client-facing errors with messageKey
- [ ] **Input validated** via contract schemas (Valibot)
- [ ] **No raw DB records returned** - always use transformers
- [ ] **Existence checks** before mutations
- [ ] **Consistent naming** per conventions above
- [ ] **Types exported** from contract packages
- [ ] **Index files updated** when adding new schemas

### Code Review Questions

1. Does the DTO expose only necessary fields?
2. Is the error handling appropriate (Http vs Internal)?
3. Are message keys following the convention?
4. Could any logic be shared via a transformer?
5. Is the service function doing one thing well?

---

## Migration Guide

When refactoring existing modules to match these patterns:

1. **Create transformer file** with `to{Dto}` functions
2. **Rename schema types** to include "Dto" suffix
3. **Split schemas** into per-endpoint files in `schemas/` folder
4. **Update service** to use transformers instead of inline mapping
5. **Verify i18n keys** follow `exception_{errorType}` pattern
6. **Update imports** in RPC targets
7. **Run typecheck** to catch any mismatches
