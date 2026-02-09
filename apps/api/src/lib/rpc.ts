import type { Env } from "$env";

import type { RpcFailure, RpcMeta, RpcResult } from "@moolah/core/rpc";
import { ok } from "@moolah/core/rpc";

import type { RequestContext } from "$lib/context";
import { createRequestContext } from "$lib/context";
import { getMessage } from "$lib/i18n";
import { isHttpException } from "$utils/is-http-exception.util";
import { isInternalException } from "$utils/is-internal-exception.util";

/**
 * Convert an exception to RpcFailure with translated message.
 */
function toRpcFailure(exception: unknown, ctx: RequestContext): RpcFailure {
	if (isHttpException(exception)) {
		return {
			ok: false,
			error: {
				code: exception.errorCode,
				message: getMessage(exception.messageKey, ctx.locale),
				context: null,
				details: null
			}
		};
	}

	const log = ctx.log.child({ context: "RPC" });

	if (isInternalException(exception)) {
		log.error(exception.message, {
			cause: exception.cause,
			metadata: {
				exceptionName: exception.name,
				exceptionTags: exception.tags,
				...exception.metadata,
				...(exception.context && {
					source: exception.context.source,
					action: exception.context.action
				})
			},
			tags: ["rpc", "service"]
		});
	} else {
		log.error("Unexpected exception", {
			cause: exception,
			tags: ["rpc"]
		});
	}

	return {
		ok: false,
		error: {
			code: "SERVER_ERROR",
			message: getMessage("global_exception_internalServerError", ctx.locale),
			context: null,
			details: null
		}
	};
}

/**
 * Create an RPC handler bound to an environment.
 *
 * Error handling:
 * - HttpException: Converted to RpcFailure with translated message
 * - InternalException: Logged, returns generic "SERVER_ERROR"
 * - Unknown: Logged, returns generic "SERVER_ERROR"
 *
 * @example
 * export class UsersRpcTarget extends RpcTarget {
 *   private rpc: ReturnType<typeof createRpcHandler>;
 *
 *   constructor(private env: Env) {
 *     super();
 *     this.rpc = createRpcHandler(env);
 *   }
 *
 *   async getUser(c, input) {
 *     return this.rpc(c, (ctx) => userService.getById(ctx, input.id));
 *   }
 * }
 */
export function createRpcHandler(env: Env) {
	return async function rpc<T>(
		rpcCtx: { id?: string; locale?: string },
		fn: (ctx: RequestContext) => Promise<T>,
		meta?: RpcMeta
	): Promise<RpcResult<T>> {
		const ctx = createRequestContext(env, rpcCtx);
		try {
			const data = await fn(ctx);
			return ok(data, meta);
		} catch (exception) {
			return toRpcFailure(exception, ctx);
		}
	};
}

/**
 * Create an RPC list handler for paginated data.
 *
 * @example
 * async getServers(c, input) {
 *   return this.rpcList(c, async (ctx) => {
 *     const { servers, total } = await serverService.list(ctx, input);
 *     return { items: servers, count: total };
 *   });
 * }
 */
export function createRpcListHandler(env: Env) {
	return async function rpcList<T>(
		rpcCtx: { id?: string; locale?: string },
		fn: (ctx: RequestContext) => Promise<{
			items: T[];
			count?: number;
			nextCursor?: string | null;
			previousCursor?: string | null;
		}>
	): Promise<RpcResult<T[]>> {
		const ctx = createRequestContext(env, rpcCtx);
		try {
			const { items, count, nextCursor, previousCursor } = await fn(ctx);
			return ok(items, {
				count: count ?? null,
				nextCursor: nextCursor ?? null,
				previousCursor: previousCursor ?? null
			});
		} catch (exception) {
			return toRpcFailure(exception, ctx);
		}
	};
}
