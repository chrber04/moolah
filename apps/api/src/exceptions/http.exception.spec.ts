import { describe, expect, test } from "vitest";

import type { HttpExceptionOptions } from "./http.exception";
import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	HttpException,
	InternalServerErrorException,
	NotFoundException,
	ServiceUnavailableException,
	TooManyRequestsException,
	UnauthorizedException
} from "./http.exception";

describe("HttpExceptions", () => {
	describe("HttpException", () => {
		test("should create an instance with provided values", () => {
			const exception = new HttpException(400, {
				errorCode: "VALIDATION_ERROR",
				messageKey: "global_exception_badRequest"
			});
			expect(exception).toBeInstanceOf(HttpException);
			expect(exception.name).toBe("HttpException");
			expect(exception.statusCode).toBe(400);
			expect(exception.errorCode).toBe("VALIDATION_ERROR");
			expect(exception.messageKey).toBe("global_exception_badRequest");
		});

		test("should create an instance with default messageKey", () => {
			const exception = new HttpException(500, { errorCode: "SERVER_ERROR" });
			expect(exception.statusCode).toBe(500);
			expect(exception.errorCode).toBe("SERVER_ERROR");
			expect(exception.messageKey).toBe("global_exception_internalServerError");
		});
	});

	describe("BadRequestException", () => {
		test("should create an instance with default values", () => {
			const exception = new BadRequestException();
			expect(exception).toBeInstanceOf(BadRequestException);
			expect(exception.name).toBe("BadRequestException");
			expect(exception.statusCode).toBe(400);
			expect(exception.errorCode).toBe("VALIDATION_ERROR");
			expect(exception.messageKey).toBe("global_exception_badRequest");
		});

		test("should create an instance with provided options", () => {
			const options: HttpExceptionOptions = {
				errorCode: "INVALID_INPUT",
				messageKey: "global_exception_badRequest"
			};
			const exception = new BadRequestException(options);
			expect(exception.errorCode).toBe("INVALID_INPUT");
			expect(exception.messageKey).toBe("global_exception_badRequest");
		});
	});

	describe("UnauthorizedException", () => {
		test("should create an instance with default values", () => {
			const exception = new UnauthorizedException();
			expect(exception).toBeInstanceOf(UnauthorizedException);
			expect(exception.name).toBe("UnauthorizedException");
			expect(exception.statusCode).toBe(401);
			expect(exception.errorCode).toBe("AUTH_REQUIRED");
			expect(exception.messageKey).toBe("global_exception_unauthorized");
		});

		test("should create an instance with provided options", () => {
			const options: HttpExceptionOptions = {
				errorCode: "AUTH_INVALID",
				messageKey: "global_exception_unauthorized"
			};
			const exception = new UnauthorizedException(options);
			expect(exception.errorCode).toBe("AUTH_INVALID");
			expect(exception.messageKey).toBe("global_exception_unauthorized");
		});
	});

	describe("ForbiddenException", () => {
		test("should create an instance with default values", () => {
			const exception = new ForbiddenException();
			expect(exception).toBeInstanceOf(ForbiddenException);
			expect(exception.name).toBe("ForbiddenException");
			expect(exception.statusCode).toBe(403);
			expect(exception.errorCode).toBe("FORBIDDEN");
			expect(exception.messageKey).toBe("global_exception_forbidden");
		});

		test("should create an instance with provided options", () => {
			const options: HttpExceptionOptions = {
				errorCode: "FORBIDDEN",
				messageKey: "global_exception_forbidden"
			};
			const exception = new ForbiddenException(options);
			expect(exception.errorCode).toBe("FORBIDDEN");
			expect(exception.messageKey).toBe("global_exception_forbidden");
		});
	});

	describe("NotFoundException", () => {
		test("should create an instance with default values", () => {
			const exception = new NotFoundException();
			expect(exception).toBeInstanceOf(NotFoundException);
			expect(exception.name).toBe("NotFoundException");
			expect(exception.statusCode).toBe(404);
			expect(exception.errorCode).toBe("NOT_FOUND");
			expect(exception.messageKey).toBe("global_exception_notFound");
		});

		test("should create an instance with provided options", () => {
			const options: HttpExceptionOptions = {
				errorCode: "NOT_FOUND",
				messageKey: "global_exception_notFound"
			};
			const exception = new NotFoundException(options);
			expect(exception.errorCode).toBe("NOT_FOUND");
			expect(exception.messageKey).toBe("global_exception_notFound");
		});
	});

	describe("ConflictException", () => {
		test("should create an instance with default values", () => {
			const exception = new ConflictException();
			expect(exception).toBeInstanceOf(ConflictException);
			expect(exception.name).toBe("ConflictException");
			expect(exception.statusCode).toBe(409);
			expect(exception.errorCode).toBe("CONFLICT");
			expect(exception.messageKey).toBe("global_exception_conflict");
		});

		test("should create an instance with provided options", () => {
			const options: HttpExceptionOptions = {
				errorCode: "ALREADY_EXISTS",
				messageKey: "global_exception_conflict"
			};
			const exception = new ConflictException(options);
			expect(exception.errorCode).toBe("ALREADY_EXISTS");
			expect(exception.messageKey).toBe("global_exception_conflict");
		});
	});

	describe("TooManyRequestsException", () => {
		test("should create an instance with default values", () => {
			const exception = new TooManyRequestsException();
			expect(exception).toBeInstanceOf(TooManyRequestsException);
			expect(exception.name).toBe("TooManyRequestsException");
			expect(exception.statusCode).toBe(429);
			expect(exception.errorCode).toBe("RATE_LIMITED");
			expect(exception.messageKey).toBe("global_exception_tooManyRequests");
		});

		test("should create an instance with provided options", () => {
			const options: HttpExceptionOptions = {
				errorCode: "RATE_LIMITED",
				messageKey: "global_exception_tooManyRequests"
			};
			const exception = new TooManyRequestsException(options);
			expect(exception.errorCode).toBe("RATE_LIMITED");
			expect(exception.messageKey).toBe("global_exception_tooManyRequests");
		});
	});

	describe("InternalServerErrorException", () => {
		test("should create an instance with default values", () => {
			const exception = new InternalServerErrorException();
			expect(exception).toBeInstanceOf(InternalServerErrorException);
			expect(exception.name).toBe("InternalServerErrorException");
			expect(exception.statusCode).toBe(500);
			expect(exception.errorCode).toBe("SERVER_ERROR");
			expect(exception.messageKey).toBe("global_exception_internalServerError");
		});

		test("should create an instance with provided options", () => {
			const options: HttpExceptionOptions = {
				errorCode: "SERVER_ERROR",
				messageKey: "global_exception_internalServerError"
			};
			const exception = new InternalServerErrorException(options);
			expect(exception.errorCode).toBe("SERVER_ERROR");
			expect(exception.messageKey).toBe("global_exception_internalServerError");
		});
	});

	describe("ServiceUnavailableException", () => {
		test("should create an instance with default values", () => {
			const exception = new ServiceUnavailableException();
			expect(exception).toBeInstanceOf(ServiceUnavailableException);
			expect(exception.name).toBe("ServiceUnavailableException");
			expect(exception.statusCode).toBe(503);
			expect(exception.errorCode).toBe("UNAVAILABLE");
			expect(exception.messageKey).toBe("global_exception_serviceUnavailable");
		});

		test("should create an instance with provided options", () => {
			const options: HttpExceptionOptions = {
				errorCode: "UNAVAILABLE",
				messageKey: "global_exception_serviceUnavailable"
			};
			const exception = new ServiceUnavailableException(options);
			expect(exception.errorCode).toBe("UNAVAILABLE");
			expect(exception.messageKey).toBe("global_exception_serviceUnavailable");
		});
	});
});
