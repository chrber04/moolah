import type { Env } from "$env";
import { drizzle } from "drizzle-orm/d1";

import type { Logger } from "@moolah/core/logger";
import { createLogger } from "@moolah/core/logger";
import * as schema from "@moolah/database/schema";

export type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Request context passed to all service functions.
 * Contains shared dependencies like the database connection, environment, and request metadata.
 *
 * @example
 * ```ts
 * import { type RequestContext, createRequestContext } from "$lib/request-context";
 *
 * // In RPC method
 * async getPosts(clientCtx: ClientRequestContext, input: GetPostsInput) {
 *   const ctx = createRequestContext(this.env, clientCtx);
 *   return await service.getPosts(ctx, input);
 * }
 *
 * // In service function
 * export async function getUser(ctx: RequestContext, id: string) {
 *   ctx.log.info("Fetching user", { metadata: { userId: id } });
 *   return ctx.db.query.users.findFirst({ where: eq(users.id, id) });
 * }
 * ```
 */
export interface RequestContext {
	/** Request trace ID for observability (correlates logs across services) */
	id?: string;
	/** Environment bindings (secrets, D1, KV, etc.) */
	env: Env;
	/** Drizzle database instance with full schema for relational queries */
	db: DrizzleDb;
	/** Current locale for i18n, defaults to "en" */
	locale: string;
	/** Structured logger with traceId bound */
	log: Logger;
}

/**
 * Create a RequestContext from environment bindings and RPC context.
 *
 * @param env - The Cloudflare environment bindings
 * @param rpcCtx - The RPC context containing locale and other request metadata
 * @returns A RequestContext with initialized Drizzle instance and logger
 */
export function createRequestContext(
	env: Env,
	rpcCtx: { id?: string; locale?: string }
): RequestContext {
	return {
		id: rpcCtx.id,
		env,
		db: drizzle(env.DB, { schema }),
		locale: rpcCtx.locale || "en",
		log: createLogger({ traceId: rpcCtx.id, service: "api" })
	};
}
