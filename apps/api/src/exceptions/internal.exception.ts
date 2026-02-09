export interface InternalExceptionContext {
	/**
	 * The source or module where the exception originated.
	 *
	 * @example 'UserService'
	 */
	source?: string;

	/**
	 * The specific action or method where the exception occurred.
	 *
	 * @example 'getUserById'
	 */
	action?: string;
}

export interface InternalExceptionOptions {
	/**
	 * A descriptive message explaining the exception.
	 *
	 * @example 'An unexpected error occurred'
	 */
	message?: string;

	/**
	 * The original error that caused this exception, if any.
	 *
	 * @example
	 * ```typescript
	 * const cause = new Error('Database connection failed');
	 * ```
	 */
	cause?: unknown;

	/**
	 * Additional metadata associated with the error.
	 *
	 * @example
	 * ```typescript
	 * {
	 *   userId: '123',
	 *   requestId: 'abc123',
	 * }
	 * ```
	 */
	metadata?: Record<string, unknown>;

	/**
	 * Contextual information about where the exception was thrown.
	 *
	 * @example
	 * ```typescript
	 * {
	 *   source: 'UserService',
	 *   action: 'getUserById',
	 * }
	 * ```
	 */
	context?: InternalExceptionContext;

	/**
	 * Tags for categorizing or filtering the exception in logs.
	 *
	 * @example
	 * ```typescript
	 * ['assertion', 'critical']
	 * ```
	 */
	tags?: string[];
}

/**
 * The base class for internal exceptions that are not intended to be propagated to the client.
 * Contains additional properties for debugging and logging purposes.
 */
export class InternalException extends Error {
	/**
	 * The original error that caused this exception.
	 */
	public override readonly cause?: unknown;

	/**
	 * Additional metadata associated with the error.
	 */
	public readonly metadata?: Record<string, unknown> | undefined;

	/**
	 * Contextual information about where the exception was thrown.
	 */
	public readonly context?: InternalExceptionContext | undefined;

	/**
	 * Tags for categorizing or filtering the exception in logs.
	 */
	public readonly tags?: string[] | undefined;

	/**
	 * Constructs a new `InternalException`.
	 *
	 * @param message - A descriptive message explaining the exception.
	 * @param options - Additional options for configuring the exception.
	 *
	 * @example
	 * new InternalException('An unexpected error occurred', {
	 *   cause: originalError,
	 *   metadata: { userId: '123' },
	 *   context: { source: 'UserService', action: 'getUserById' },
	 *   tags: ['critical'],
	 * });
	 */
	constructor(message: string, options: InternalExceptionOptions = {}) {
		super(message);
		this.name = "InternalException";
		this.cause = options.cause;
		this.metadata = options.metadata;
		this.context = options.context;
		this.tags = options.tags;
	}
}

/**
 * Represents an exception thrown when an assertion fails.
 */
export class AssertionFailedException extends InternalException {
	/**
	 * Constructs a new AssertionFailedException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new AssertionFailedException({
	 *   message: "Assertion failed",
	 *   metadata: { userId: '123' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "Assertion failed", options);
		this.name = "AssertionFailedException";
	}
}

/**
 * Represents an exception thrown when an external service fails.
 */
export class ExternalServiceFailedException extends InternalException {
	/**
	 * Constructs a new ExternalServiceFailedException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new ExternalServiceFailedException({
	 *   message: "External service failure",
	 *   metadata: { serviceUrl: 'https://api.example.com' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "External service failure", options);
		this.name = "ExternalServiceFailedException";
	}
}

/**
 * Represents an exception thrown when an external service returns invalid data.
 */
export class ExternalServiceDataValidationException extends InternalException {
	/**
	 * Constructs a new ExternalServiceDataValidationException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new ExternalServiceDataValidationException({
	 *   message: "External service returned invalid data",
	 *   metadata: { serviceUrl: 'https://api.example.com' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "External service returned invalid data", options);
		this.name = "ExternalServiceDataValidationException";
	}
}

/**
 * Represents an exception thrown when a required argument is missing.
 */
export class MissingArgumentException extends InternalException {
	/**
	 * Constructs a new MissingArgumentException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new MissingArgumentException({
	 *   message: "Missing argument",
	 *   metadata: { argumentName: 'username' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "Missing argument", options);
		this.name = "MissingArgumentException";
	}
}

/**
 * Represents an exception thrown when an invalid argument is provided.
 */
export class InvalidArgumentException extends InternalException {
	/**
	 * Constructs a new InvalidArgumentException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new InvalidArgumentException({
	 *   message: "Invalid argument",
	 *   metadata: { argumentName: 'email' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "Invalid argument", options);
		this.name = "InvalidArgumentException";
	}
}

/**
 * Represents an exception thrown when a required field is missing.
 */
export class MissingFieldException extends InternalException {
	/**
	 * Constructs a new MissingFieldException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new MissingFieldException({
	 *   message: "Missing field",
	 *   metadata: { fieldName: 'email' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "Missing field", options);
		this.name = "MissingFieldException";
	}
}

/**
 * Represents an exception thrown when a field is invalid.
 */
export class InvalidFieldException extends InternalException {
	/**
	 * Constructs a new InvalidFieldException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new InvalidFieldException({
	 *   message: "Invalid field",
	 *   metadata: { fieldName: 'email' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "Invalid field", options);
		this.name = "InvalidFieldException";
	}
}

/**
 * Represents an exception thrown when permission is denied.
 */
export class PermissionDeniedException extends InternalException {
	/**
	 * Constructs a new PermissionDeniedException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new PermissionDeniedException({
	 *   message: "Permission denied",
	 *   metadata: { userId: '123' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "Permission denied", options);
		this.name = "PermissionDeniedException";
	}
}

/**
 * Represents an exception thrown when a precondition fails.
 */
export class PreconditionFailedException extends InternalException {
	/**
	 * Constructs a new PreconditionFailedException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new PreconditionFailedException({
	 *   message: "Precondition failed",
	 *   metadata: { condition: 'User must be logged in' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "Precondition failed", options);
		this.name = "PreconditionFailedException";
	}
}

/**
 * Represents an exception thrown when a requested resource is not found.
 */
export class ResourceNotFoundException extends InternalException {
	/**
	 * Constructs a new ResourceNotFoundException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new ResourceNotFoundException({
	 *   message: "Resource not found",
	 *   metadata: { resourceId: '123' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "Resource not found", options);
		this.name = "ResourceNotFoundException";
	}
}

/**
 * Represents an exception thrown when an unexpected error occurs.
 */
export class UnexpectedException extends InternalException {
	/**
	 * Constructs a new UnexpectedException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new UnexpectedException({
	 *   message: "An unexpected error occurred",
	 *   metadata: { context: 'Database operation' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "An unexpected error occurred", options);
		this.name = "UnexpectedException";
	}
}

/**
 * Represents an exception thrown when there is an invalid configuration.
 */
export class InvalidConfigurationException extends InternalException {
	/**
	 * Constructs a new InvalidConfigurationException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new InvalidConfigurationException({
	 *   message: "Invalid configuration",
	 *   metadata: { configKey: 'API_URL' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "Invalid configuration", options);
		this.name = "InvalidConfigurationException";
	}
}

/**
 * Represents an exception thrown when there is a failure in a dependency.
 */
export class DependencyException extends InternalException {
	/**
	 * Constructs a new DependencyException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new DependencyException({
	 *   message: "Dependency failure",
	 *   metadata: { dependency: 'Service XYZ' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "Dependency failure", options);
		this.name = "DependencyException";
	}
}

/**
 * Represents an exception thrown to interrupt control flow.
 * These exceptions are expected parts of program flow and do not necessarily indicate an error.
 */
export class ControlFlowException extends InternalException {
	/**
	 * Constructs a new ControlFlowException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new ControlFlowException({
	 *   message: "Dry run completed, transaction rolled back",
	 *   metadata: { operation: 'syncTaskProviderTasks' }
	 * });
	 */
	constructor(options: InternalExceptionOptions = {}) {
		super(options.message ?? "Control flow interruption", options);
		this.name = "ControlFlowException";
	}
}
