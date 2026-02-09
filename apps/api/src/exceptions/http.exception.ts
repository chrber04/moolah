import type { HttpStatusCode } from "@moolah/common/types";
import type { RpcErrorCode } from "@moolah/core/rpc";

import type { MessageKey } from "$lib/i18n";

export interface HttpExceptionOptions {
	/**
	 * A machine-readable error code identifying the type of error.
	 *
	 * @example 'VALIDATION_ERROR'
	 */
	errorCode?: RpcErrorCode;

	/**
	 * Message key for translated error messages.
	 *
	 * @example 'global_exception_notFound'
	 */
	messageKey?: MessageKey;
}

/**
 * The base class for RPC exceptions that are intended to be propagated to the client.
 * Extends the built-in `Error` class and includes RPC-specific properties such as status code and i18n information.
 */
export class HttpException extends Error {
	/**
	 * The HTTP status code of the exception.
	 *
	 * @example 400
	 */
	public readonly statusCode: HttpStatusCode;

	/**
	 * A machine-readable error code identifying the type of error.
	 *
	 * @example 'VALIDATION_ERROR'
	 */
	public readonly errorCode: RpcErrorCode;

	/**
	 * Message key for translated error messages.
	 *
	 * @example 'global_exception_notFound'
	 */
	public readonly messageKey: MessageKey;

	/**
	 * Constructs a new `HttpException`.
	 *
	 * @param statusCode - The HTTP status code for the exception.
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * new HttpException(400, {
	 *   errorCode: 'VALIDATION_ERROR',
	 *   i18n: 'global_exception_badRequest',
	 * });
	 */
	constructor(statusCode: HttpStatusCode, options: HttpExceptionOptions = {}) {
		super();
		this.name = "HttpException";
		this.statusCode = statusCode;
		this.errorCode = options.errorCode ?? "SERVER_ERROR";
		this.messageKey = options.messageKey ?? "global_exception_internalServerError";
	}
}

/**
 * Exception representing a 400 Bad Request error.
 */
export class BadRequestException extends HttpException {
	/**
	 * Constructs a new BadRequestException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new BadRequestException({
	 *   errorCode: 'VALIDATION_ERROR',
	 *   messageKey: 'global_exception_badRequest',
	 * });
	 */
	constructor(options: HttpExceptionOptions = {}) {
		super(400, {
			errorCode: options.errorCode ?? "VALIDATION_ERROR",
			messageKey: options.messageKey ?? "global_exception_badRequest"
		});
		this.name = "BadRequestException";
	}
}

/**
 * Exception representing a 401 Unauthorized error.
 */
export class UnauthorizedException extends HttpException {
	/**
	 * Constructs a new UnauthorizedException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new UnauthorizedException({
	 *   errorCode: 'AUTH_REQUIRED',
	 *   messageKey: 'global_exception_unauthorized',
	 * });
	 */
	constructor(options: HttpExceptionOptions = {}) {
		super(401, {
			errorCode: options.errorCode ?? "AUTH_REQUIRED",
			messageKey: options.messageKey ?? "global_exception_unauthorized"
		});
		this.name = "UnauthorizedException";
	}
}

/**
 * Exception representing a 403 Forbidden error.
 */
export class ForbiddenException extends HttpException {
	/**
	 * Constructs a new ForbiddenException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new ForbiddenException({
	 *   errorCode: 'FORBIDDEN',
	 *   messageKey: 'global_exception_forbidden',
	 * });
	 */
	constructor(options: HttpExceptionOptions = {}) {
		super(403, {
			errorCode: options.errorCode ?? "FORBIDDEN",
			messageKey: options.messageKey ?? "global_exception_forbidden"
		});
		this.name = "ForbiddenException";
	}
}

/**
 * Exception representing a 404 Not Found error.
 */
export class NotFoundException extends HttpException {
	/**
	 * Constructs a new NotFoundException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new NotFoundException({
	 *   errorCode: 'NOT_FOUND',
	 *   messageKey: 'global_exception_notFound',
	 * });
	 */
	constructor(options: HttpExceptionOptions = {}) {
		super(404, {
			errorCode: options.errorCode ?? "NOT_FOUND",
			messageKey: options.messageKey ?? "global_exception_notFound"
		});
		this.name = "NotFoundException";
	}
}

/**
 * Exception representing a 409 Conflict error.
 */
export class ConflictException extends HttpException {
	/**
	 * Constructs a new ConflictException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new ConflictException({
	 *   errorCode: 'CONFLICT',
	 *   messageKey: 'global_exception_conflict',
	 * });
	 */
	constructor(options: HttpExceptionOptions = {}) {
		super(409, {
			errorCode: options.errorCode ?? "CONFLICT",
			messageKey: options.messageKey ?? "global_exception_conflict"
		});
		this.name = "ConflictException";
	}
}

/**
 * Exception representing a 429 Too Many Requests error.
 */
export class TooManyRequestsException extends HttpException {
	/**
	 * Constructs a new TooManyRequestsException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new TooManyRequestsException({
	 *   errorCode: 'RATE_LIMITED',
	 *   messageKey: 'global_exception_tooManyRequests',
	 * });
	 */
	constructor(options: HttpExceptionOptions = {}) {
		super(429, {
			errorCode: options.errorCode ?? "RATE_LIMITED",
			messageKey: options.messageKey ?? "global_exception_tooManyRequests"
		});
		this.name = "TooManyRequestsException";
	}
}

/**
 * Exception representing a 500 Internal Server Error.
 */
export class InternalServerErrorException extends HttpException {
	/**
	 * Constructs a new InternalServerErrorException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new InternalServerErrorException({
	 *   errorCode: 'SERVER_ERROR',
	 *   messageKey: 'global_exception_internalServerError',
	 * });
	 */
	constructor(options: HttpExceptionOptions = {}) {
		super(500, {
			errorCode: options.errorCode ?? "SERVER_ERROR",
			messageKey: options.messageKey ?? "global_exception_internalServerError"
		});
		this.name = "InternalServerErrorException";
	}
}

/**
 * Exception representing a 503 Service Unavailable error.
 */
export class ServiceUnavailableException extends HttpException {
	/**
	 * Constructs a new ServiceUnavailableException.
	 *
	 * @param options - Options for configuring the exception.
	 *
	 * @example
	 * throw new ServiceUnavailableException({
	 *   errorCode: 'UNAVAILABLE',
	 *   messageKey: 'global_exception_serviceUnavailable',
	 * });
	 */
	constructor(options: HttpExceptionOptions = {}) {
		super(503, {
			errorCode: options.errorCode ?? "UNAVAILABLE",
			messageKey: options.messageKey ?? "global_exception_serviceUnavailable"
		});
		this.name = "ServiceUnavailableException";
	}
}
