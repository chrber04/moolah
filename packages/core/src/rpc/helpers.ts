import type { RpcFailure, RpcMeta, RpcSuccess } from "./types.js";

// ============================================================================
// Success Helper
// ============================================================================

/**
 * Create a successful RPC result
 *
 * @example
 * return ok({ user: { id: '123', name: 'John' } });
 * return ok(users, { count: 100, nextCursor: 'abc' });
 */
export function ok<T>(data: T, meta?: RpcMeta | null): RpcSuccess<T> {
	return { ok: true, data, meta: meta ?? null };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if an RPC result is successful
 */
export function isOk<T>(result: { ok: boolean; data?: T }): result is RpcSuccess<T> {
	return result.ok === true;
}

/**
 * Check if an RPC result is a failure
 */
export function isErr(result: { ok: boolean }): result is RpcFailure {
	return result.ok === false;
}
