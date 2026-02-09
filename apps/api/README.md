# Moolah API

Hono-based API running on Cloudflare Workers with RPC support.

## Architecture

### RPC Entrypoints

This worker exposes **two separate entrypoints** for service bindings:

**1. ClientAPI** - Public client operations

```typescript
export class ClientAPI extends WorkerEntrypoint<Env> {
	get blog() {
		return new BlogClientRpcTarget(this.env);
	}
	get users() {
		return new UsersRpcTarget(this.env);
	}
	get auth() {
		return new AuthRpcTarget(this.env);
	}
	get boosts() {
		return new BoostsRpcTarget(this.env);
	}
	get stats() {
		return new StatsRpcTarget(this.env);
	}
}
```

**2. AdminAPI** - Admin-only operations

```typescript
export class AdminAPI extends WorkerEntrypoint<Env> {
	get blog() {
		return new BlogAdminRpcTarget(this.env);
	}
	// Add more admin modules as needed
}
```

### Service Layer Pattern

```
RPC Target → Service → Database
```

**Example:**

```
BlogClientRpcTarget (*.rpc.ts)
  └─→ blogService.getPosts (*.service.ts)
      └─→ ctx.db.query.blogPosts.findMany()
```

### Request Context Pattern

All service functions receive a `RequestContext`:

```typescript
export interface RequestContext {
	db: DrizzleDb; // Drizzle instance with schema
	locale: string; // i18n locale
}
```

**Benefits:**

- Dependency injection
- Easy mocking for tests
- Consistent across all services

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts              # RPC entrypoints (ClientAPI, AdminAPI)
│   ├── app.ts                # Hono app for HTTP requests
│   ├── env.ts                # Environment config
│   │
│   ├── lib/
│   │   └── request-context.ts  # RequestContext utilities
│   │
│   ├── modules/
│   │   ├── blog/
│   │   │   ├── blog.client.rpc.ts      # Client RPC target
│   │   │   ├── blog.admin.rpc.ts       # Admin RPC target
│   │   │   ├── blog.client.service.ts  # Client service layer
│   │   │   ├── blog.admin.service.ts   # Admin service layer
│   │   │   └── blog.service.ts         # Shared service logic
│   │   ├── users/
│   │   ├── auth/
│   │   └── ...
│   │
│   └── seed/                 # Database seeding scripts
│
├── drizzle/
│   └── migrations/           # Generated SQL migrations
│
├── wrangler.jsonc            # Cloudflare Worker config
└── drizzle.config.ts         # Drizzle Kit config
```

## Development

```bash
# Install dependencies
pnpm install

# Start dev server (localhost:4000)
pnpm dev

# Type checking
pnpm typecheck

# Generate Cloudflare binding types
pnpm cf-typegen
```

## Database

### Migrations

```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate:local     # Local D1
pnpm db:migrate:staging   # Staging
pnpm db:migrate:prod      # Production

# Open Drizzle Studio
pnpm db:studio
```

### Seeding

```bash
pnpm db:seed:local
```

## Deployment

```bash
# Deploy to Cloudflare Workers
pnpm deploy

# Deploy to staging
pnpm deploy --env staging

# Deploy to production
pnpm deploy --env production
```

## Configuration

### wrangler.jsonc

```jsonc
{
	"name": "api",
	"main": "src/index.ts",
	"compatibility_date": "2025-11-24",

	"d1_databases": [
		{
			"binding": "DB",
			"database_name": "moolah-db-dev",
			"migrations_dir": "./drizzle/migrations"
		}
	]
}
```

### Environment Variables

Set via:

```bash
wrangler secret put SECRET_NAME
```

Or in `wrangler.jsonc`:

```jsonc
{
	"vars": {
		"MY_VAR": "value"
	}
}
```

## Adding a New RPC Module

1. **Create contract schemas** in `@moolah/contract` or `@moolah/contract-admin`
2. **Create RPC target** in `src/modules/{module}/{module}.rpc.ts`
3. **Create service layer** in `src/modules/{module}/{module}.service.ts`
4. **Export from index.ts**:
   ```typescript
   export class ClientAPI extends WorkerEntrypoint<Env> {
   	get myModule() {
   		return new MyModuleRpcTarget(this.env);
   	}
   }
   ```

## Type Safety

- **Contracts**: Shared types from `@moolah/contract*` packages
- **Database**: Types auto-generated from Drizzle schema
- **Bindings**: Generated via `pnpm cf-typegen` from `wrangler.jsonc`

## Dependencies

- `@moolah/database` - Drizzle schemas
- `@moolah/contract` - Client RPC contracts
- `@moolah/contract-admin` - Admin RPC contracts
- `@moolah/core` - Domain logic and types
- `hono` - Web framework
- `drizzle-orm` - Type-safe ORM
