/**
 * Structured logger for Cloudflare Workers/Pages
 * Outputs JSON for easy parsing in Logpush/Tail Workers
 *
 */

import type { LogEntry, Logger, LogLevel, LogObject } from "./types.js";

/**
 * Base context for logger instances
 */
interface LoggerContext {
	traceId?: string;
	service?: string;
	context?: string;
	operation?: string;
}

/**
 * Serialize an error for structured logging.
 *
 * @param error - The error to serialize
 * @returns Structured error object for JSON output
 */
function serializeError(error: unknown): LogEntry["cause"] {
	if (error instanceof Error) {
		return {
			name: error.name,
			message: error.message,
			stack: error.stack?.split("\n").slice(0, 5).join("\n"), 
			code: (error as Error & { code?: string }).code
		};
	}

	return {
		name: "UnknownError",
		message: String(error)
	};
}

/**
 * Build the final log entry from message, context, and log object.
 */
function buildEntry(
	level: LogLevel,
	message: string,
	baseContext: LoggerContext,
	obj?: LogObject
): LogEntry {
	const entry: LogEntry = {
		level,
		message,
		timestamp: Date.now()
	};

	if (baseContext.traceId) entry.traceId = baseContext.traceId;
	if (baseContext.service) entry.service = baseContext.service;
	if (baseContext.context) entry.context = baseContext.context;
	if (baseContext.operation) entry.operation = baseContext.operation;

	if (obj) {
		if (obj.traceId) entry.traceId = obj.traceId;
		if (obj.service) entry.service = obj.service;
		if (obj.context) entry.context = obj.context;
		if (obj.operation) entry.operation = obj.operation;
		if (obj.tags?.length) entry.tags = obj.tags;
		if (obj.cause) entry.cause = serializeError(obj.cause);

		// Keep metadata nested for cleaner separation
		if (obj.metadata && Object.keys(obj.metadata).length > 0) {
			entry.metadata = obj.metadata;
		}
	}

	return entry;
}

/**
 * Write log entry to console with appropriate method.
 */
function writeLog(entry: LogEntry): void {
	const output = JSON.stringify(entry);

	switch (entry.level) {
		case "debug":
			console.debug(output);
			break;
		case "info":
			console.info(output);
			break;
		case "warn":
			console.warn(output);
			break;
		case "error":
			console.error(output);
			break;
		case "fatal":
			console.error(output); // No console.fatal, use error
			break;
	}
}

/**
 * Create a structured logger with base context.
 *
 * @param baseContext - Default context included in all log entries
 * @returns Logger instance with debug, info, warn, error, fatal methods
 *
 * @example
 * ```ts
 * // In RPC handler
 * const log = createLogger({ traceId: ctx.id });
 * log.info("Request started", { tags: ["rpc"] });
 *
 * // In service
 * const log = createLogger({ traceId: ctx.id, context: "AuthService" });
 * log.error("Token expired", {
 *   cause: error,
 *   metadata: { userId: "123" },
 *   tags: ["auth"]
 * });
 *
 * // Child logger for specific operation
 * const opLog = log.child({ operation: "refreshToken" });
 * opLog.debug("Validating refresh token");
 * ```
 */
export function createLogger(baseContext: LoggerContext = {}): Logger {
	const log = (level: LogLevel, message: string, obj?: LogObject) => {
		writeLog(buildEntry(level, message, baseContext, obj));
	};

	return {
		debug: (message, obj) => log("debug", message, obj),
		info: (message, obj) => log("info", message, obj),
		warn: (message, obj) => log("warn", message, obj),
		error: (message, obj) => log("error", message, obj),
		fatal: (message, obj) => log("fatal", message, obj),
		child: (context) =>
			createLogger({
				...baseContext,
				...context,
				// Preserve immutable fields from base
				traceId: context.traceId ?? baseContext.traceId,
				service: baseContext.service // Service is immutable,always from base
			})
	};
}
