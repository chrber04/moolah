/**
 * RPC Types - Shared between API and clients
 *
 * Design: API translates errors, clients just display
 */

// ============================================================================
// Metadata Types
// ============================================================================

/**
 * Pagination/collection metadata for list responses
 */
export interface RpcMeta {
	/** Total count of items in the collection */
	count?: number | null;
	/** Cursor for fetching the next page */
	nextCursor?: string | null;
	/** Cursor for fetching the previous page */
	previousCursor?: string | null;
}

/**
 * Validation error detail for a specific field
 */
export interface RpcErrorDetail {
	/** The field that caused the error (e.g., "email", "password") */
	field: string;
	/** Error message for this field (pre-translated) */
	message: string;
}

// ============================================================================
// Error Codes
// ============================================================================

/**
 * Standard error codes for RPC responses.
 * Used for programmatic handling (redirects, special UI).
 * The `message` field contains the translated text.
 */
export type RpcErrorCode =
	// Authentication (401)
	| "AUTH_REQUIRED"
	| "AUTH_INVALID"
	| "AUTH_EXPIRED"
	// Authorization (403)
	| "FORBIDDEN"
	// Validation (400)
	| "VALIDATION_ERROR"
	| "INVALID_INPUT"
	// Resources (404, 409)
	| "NOT_FOUND"
	| "ALREADY_EXISTS"
	| "CONFLICT"
	// Rate limiting (429)
	| "RATE_LIMITED"
	// Server errors (500, 503)
	| "SERVER_ERROR"
	| "UNAVAILABLE";

/**
 * HTTP status code for each error code
 */
export const httpStatus: Record<RpcErrorCode, number> = {
	AUTH_REQUIRED: 401,
	AUTH_INVALID: 401,
	AUTH_EXPIRED: 401,
	FORBIDDEN: 403,
	VALIDATION_ERROR: 400,
	INVALID_INPUT: 400,
	NOT_FOUND: 404,
	ALREADY_EXISTS: 409,
	CONFLICT: 409,
	RATE_LIMITED: 429,
	SERVER_ERROR: 500,
	UNAVAILABLE: 503
};

// ============================================================================
// Result Types
// ============================================================================

/**
 * RPC error structure.
 * `message` is pre-translated by the API using request locale.
 */
export interface RpcError {
	/** Machine-readable error code (for programmatic handling) */
	code: RpcErrorCode;
	/** Human-readable message (pre-translated by API) */
	message: string;
	/** Optional context data */
	context?: Record<string, string | number> | null;
	/** Validation error details (for forms) */
	details?: RpcErrorDetail[] | null;
}

/**
 * Successful RPC result
 */
export interface RpcSuccess<T> {
	ok: true;
	data: T;
	/** Optional pagination/collection metadata */
	meta?: RpcMeta | null;
}

/**
 * Failed RPC result
 */
export interface RpcFailure {
	ok: false;
	error: RpcError;
}

/**
 * Discriminated union for all RPC responses.
 *
 * @example
 * const result = await api.users.getProfile({ id });
 * if (!result.ok) {
 *   // Display pre-translated error message
 *   showError(result.error.message);
 * } else {
 *   // Use the data
 *   console.log(result.data);
 * }
 */
export type RpcResult<T> = RpcSuccess<T> | RpcFailure;
