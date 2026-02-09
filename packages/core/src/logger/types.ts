/**
 * Logger types for structured JSON logging
 * Optimized for Cloudflare Logpush and log aggregation systems
 *
 *
 */

// ============================================================
// LOG LEVELS
// ============================================================

/**
 * Log severity levels in ascending order of importance.
 *
 * @remarks
 * - `debug`: Verbose debugging information (development only)
 * - `info`: Normal operational events
 * - `warn`: Potentially harmful situations
 * - `error`: Error events that might still allow the app to continue
 * - `fatal`: Severe errors causing premature termination
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

// ============================================================
// LOG TAGS
// ============================================================

/**
 * Predefined tags for categorizing logs and events.
 *
 * @remarks
 * Tags enable consistent categorization across the codebase,
 * making it easier to filter and search logs in aggregation systems.
 *
 * @example
 * ```ts
 * log.info("User created", { tags: ["user", "database"] });
 * ```
 */
export type LogTag =
	// Domain
	| "user"
	| "auth"
	| "server"
	| "blog"
	| "discord"
	// Infrastructure
	| "database"
	| "cache"
	| "rpc"
	| "http"
	// Operations
	| "service"
	| "middleware"
	| "job"
	| "queue"
	// Cross-cutting
	| "performance"
	| "security"
	| "audit"
	| "external";

// ============================================================
// LOG OBJECT
// ============================================================

/**
 * Structured log entry optimized for JSON querying in aggregation systems.
 *
 * @remarks
 * Designed for efficient querying in systems like Cloudflare Logpush,
 * Datadog, or Grafana Loki. Fields balance completeness with performance.
 *
 * @example
 * ```ts
 * // Basic log
 * log.info("Payment processed", {
 *   metadata: { orderId: "ord_123", amount: 99.99 },
 *   tags: ["payment"]
 * });
 *
 * // Error log with cause
 * log.error("Payment failed", {
 *   cause: error,
 *   metadata: { orderId: "ord_123", retryCount: 3 },
 *   tags: ["payment", "external"]
 * });
 * ```
 */
export interface LogObject {
	// ============================================================
	// DEVELOPER-PROVIDED FIELDS
	// ============================================================

	/**
	 * Error or exception that triggered this log.
	 *
	 * @remarks
	 * Pass the original error here for proper serialization.
	 * The logger extracts: message, stack, name, code, etc.
	 * Enables queries like: `cause.name = "ValidationError"`
	 *
	 * @example new Error("Connection timeout")
	 * @example new ApiError("NOT_FOUND", { resource: "User" })
	 */
	cause?: unknown;

	/**
	 * Business logic context and debugging data.
	 *
	 * @remarks
	 * Use for operation-specific data. Keep values JSON-serializable.
	 * Avoid large objects or sensitive data (passwords, tokens).
	 *
	 * @example
	 * ```ts
	 * // RPC operation
	 * { operation: "getUser", userId: "123", duration: 45 }
	 *
	 * // External API call
	 * { service: "discord", endpoint: "/guilds", statusCode: 200 }
	 *
	 * // Database operation
	 * { table: "users", action: "insert", rowsAffected: 1 }
	 * ```
	 */
	metadata?: Record<string, unknown>;

	/**
	 * Categorization tags for filtering and alerting.
	 *
	 * @remarks
	 * Use consistent tags across your app. Enables queries like:
	 * `tags contains "auth" AND level = "error"`
	 *
	 * @example ["auth", "security"]
	 * @example ["database", "performance"]
	 * @example ["discord", "external"]
	 */
	tags?: LogTag[];

	// ============================================================
	// CONTEXT FIELDS (set via createLogger)
	// ============================================================

	/**
	 * Request trace ID for distributed tracing.
	 *
	 * @remarks
	 * Correlates logs across SvelteKit → Worker requests.
	 * Set automatically when using `createLogger({ traceId })`.
	 *
	 * @example "550e8400-e29b-41d4-a716"
	 */
	traceId?: string;

	/**
	 * Service/application identifier for log aggregation.
	 *
	 * @remarks
	 * Identifies which Cloudflare Worker/Pages produced this log.
	 * Essential for filtering when logs from multiple services are aggregated.
	 * Set once when creating the base logger, immutable across child loggers.
	 *
	 * Query example: `service = "api" AND level = "error"`
	 *
	 * @example "api" - Hono API Cloudflare Worker
	 * @example "web" - SvelteKit Cloudflare Pages
	 * @example "admin" - Admin panel (if separate)
	 */
	service?: string;

	/**
	 * Module or layer context within a service.
	 *
	 * @remarks
	 * Identifies which part of the service logged this.
	 * Use with `service` for precise filtering:
	 * `service = "api" AND context = "RPC" AND level = "error"`
	 *
	 * @example "RPC" - RPC handler layer
	 * @example "Auth" - Authentication module
	 * @example "Database" - Database operations
	 */
	context?: string;

	/**
	 * Specific operation or method being executed.
	 *
	 * @remarks
	 * Combined with `context`, pinpoints exact code location.
	 * Query: `context = "UserService" AND operation = "create"`
	 *
	 * @example "create"
	 * @example "refreshToken"
	 * @example "validateSession"
	 */
	operation?: string;
}

// ============================================================
// SERIALIZED LOG ENTRY
// ============================================================

/**
 * Final JSON structure written to console/logpush.
 *
 * @remarks
 * This is what gets serialized to JSON. The logger transforms
 * `LogObject` into this structure with additional fields.
 */
export interface LogEntry {
	/** Log severity level */
	level: LogLevel;

	/** Human-readable message */
	message: string;

	/** Unix timestamp in milliseconds */
	timestamp: number;

	/** Request trace ID (if provided) */
	traceId?: string;

	/** Service/application identifier (e.g., "api", "web") */
	service?: string;

	/** Module/layer context (e.g., "RPC", "Auth") */
	context?: string;

	/** Operation name (if provided) */
	operation?: string;

	/** Categorization tags */
	tags?: LogTag[];

	/** Serialized error information */
	cause?: {
		/** Error class name */
		name: string;
		/** Error message */
		message: string;
		/** Stack trace (truncated in production) */
		stack?: string;
		/** Error code if present (e.g., "ECONNREFUSED", "NOT_FOUND") */
		code?: string;
	};

	/** Business logic context and debugging data (nested for clean separation) */
	metadata?: Record<string, unknown>;
}

// ============================================================
// LOGGER INTERFACE
// ============================================================

/**
 * Structured logger interface for consistent logging across the application.
 *
 * @example
 * ```ts
 * import { createLogger } from "@moolah/core/logger";
 *
 * // Create logger with trace context
 * const log = createLogger({ traceId: ctx.id, context: "AuthService" });
 *
 * // Basic logging
 * log.info("User logged in", { metadata: { userId: "123" } });
 *
 * // Error logging with cause
 * log.error("Failed to refresh token", {
 *   cause: error,
 *   metadata: { userId: "123", tokenAge: 3600 },
 *   tags: ["auth", "security"]
 * });
 *
 * // Child logger for specific operation
 * const opLog = log.child({ operation: "validateSession" });
 * opLog.debug("Checking token expiry");
 * ```
 */
export interface Logger {
	/**
	 * Log at debug level - verbose information for development.
	 *
	 * @param message - Human-readable description
	 * @param obj - Additional log data (cause, metadata, tags)
	 *
	 * @example
	 * ```ts
	 * log.debug("Cache lookup", { metadata: { key: "user:123", hit: true } });
	 * ```
	 */
	debug(message: string, obj?: LogObject): void;

	/**
	 * Log at info level - normal operational events.
	 *
	 * @param message - Human-readable description
	 * @param obj - Additional log data (cause, metadata, tags)
	 *
	 * @example
	 * ```ts
	 * log.info("User registered", {
	 *   metadata: { userId: "123", method: "discord" },
	 *   tags: ["user", "auth"]
	 * });
	 * ```
	 */
	info(message: string, obj?: LogObject): void;

	/**
	 * Log at warn level - potentially harmful situations.
	 *
	 * @param message - Human-readable description
	 * @param obj - Additional log data (cause, metadata, tags)
	 *
	 * @example
	 * ```ts
	 * log.warn("Rate limit approaching", {
	 *   metadata: { userId: "123", requests: 95, limit: 100 },
	 *   tags: ["security"]
	 * });
	 * ```
	 */
	warn(message: string, obj?: LogObject): void;

	/**
	 * Log at error level - error events that may allow app to continue.
	 *
	 * @param message - Human-readable description
	 * @param obj - Additional log data (cause, metadata, tags)
	 *
	 * @example
	 * ```ts
	 * log.error("Database query failed", {
	 *   cause: error,
	 *   metadata: { query: "findUser", table: "users" },
	 *   tags: ["database"]
	 * });
	 * ```
	 */
	error(message: string, obj?: LogObject): void;

	/**
	 * Log at fatal level - severe errors causing termination.
	 *
	 * @param message - Human-readable description
	 * @param obj - Additional log data (cause, metadata, tags)
	 *
	 * @example
	 * ```ts
	 * log.fatal("Database connection lost", {
	 *   cause: error,
	 *   tags: ["database"]
	 * });
	 * ```
	 */
	fatal(message: string, obj?: LogObject): void;

	/**
	 * Create a child logger with additional base context.
	 *
	 * @param context - Additional fields to include in all logs from the child
	 * @returns A new Logger instance with merged context
	 *
	 * @example
	 * ```ts
	 * // Add operation context
	 * const opLog = log.child({ operation: "createUser" });
	 * opLog.info("Validating input");
	 * opLog.info("Inserting into database");
	 *
	 * // Add user context
	 * const userLog = log.child({ metadata: { userId: "123" } });
	 * ```
	 */
	child(context: Partial<LogObject>): Logger;
}
