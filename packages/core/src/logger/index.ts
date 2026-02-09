/**
 * Structured logger for Cloudflare Workers/Pages
 *
 * @example
 * ```ts
 * import { createLogger } from "@moolah/core/logger";
 *
 * // Basic usage with trace ID
 * const log = createLogger({ traceId: ctx.id });
 * log.info("Request started", { tags: ["rpc"] });
 *
 * // With context and operation
 * const log = createLogger({
 *   traceId: ctx.id,
 *   context: "AuthService",
 *   operation: "refreshToken"
 * });
 *
 * // Error with cause and metadata
 * log.error("Token refresh failed", {
 *   cause: error,
 *   metadata: { userId: "123", tokenAge: 3600 },
 *   tags: ["auth", "security"]
 * });
 *
 * // Child logger for sub-operations
 * const dbLog = log.child({ operation: "insertSession" });
 * dbLog.debug("Inserting session record");
 * ```
 *
 */

export { createLogger } from "./logger.js";
export type { LogEntry, LogLevel, Logger, LogObject, LogTag } from "./types.js";
