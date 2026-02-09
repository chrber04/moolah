import { describe, expect, test } from "vitest";

import type { InternalExceptionOptions } from "./internal.exception";
import {
	AssertionFailedException,
	ControlFlowException,
	DependencyException,
	ExternalServiceDataValidationException,
	ExternalServiceFailedException,
	InternalException,
	InvalidArgumentException,
	InvalidConfigurationException,
	InvalidFieldException,
	MissingArgumentException,
	MissingFieldException,
	PermissionDeniedException,
	PreconditionFailedException,
	ResourceNotFoundException,
	UnexpectedException
} from "./internal.exception";

describe("InternalExceptions", () => {
	describe("InternalException", () => {
		test("should create an instance with default values", () => {
			const exception = new InternalException("An unexpected error occurred");
			expect(exception).toBeInstanceOf(InternalException);
			expect(exception.name).toBe("InternalException");
			expect(exception.message).toBe("An unexpected error occurred");
			expect(exception.cause).toBeUndefined();
			expect(exception.metadata).toBeUndefined();
			expect(exception.context).toBeUndefined();
			expect(exception.tags).toBeUndefined();
		});

		test("should create an instance with provided options", () => {
			const options: InternalExceptionOptions = {
				cause: new Error("Database connection failed"),
				metadata: { userId: "123" },
				context: { source: "UserService", action: "getUserById" },
				tags: ["critical"]
			};
			const exception = new InternalException("An unexpected error occurred", options);
			expect(exception.cause).toEqual(new Error("Database connection failed"));
			expect(exception.metadata).toEqual({ userId: "123" });
			expect(exception.context).toEqual({ source: "UserService", action: "getUserById" });
			expect(exception.tags).toEqual(["critical"]);
		});
	});

	describe("AssertionFailedException", () => {
		test("should create an instance with default message", () => {
			const exception = new AssertionFailedException();
			expect(exception).toBeInstanceOf(AssertionFailedException);
			expect(exception.name).toBe("AssertionFailedException");
			expect(exception.message).toBe("Assertion failed");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new AssertionFailedException({
				message: "Assertion failed",
				metadata: { userId: "123" }
			});
			expect(exception.message).toBe("Assertion failed");
			expect(exception.metadata).toEqual({ userId: "123" });
		});
	});

	describe("ExternalServiceFailedException", () => {
		test("should create an instance with default message", () => {
			const exception = new ExternalServiceFailedException();
			expect(exception).toBeInstanceOf(ExternalServiceFailedException);
			expect(exception.name).toBe("ExternalServiceFailedException");
			expect(exception.message).toBe("External service failure");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new ExternalServiceFailedException({
				message: "External service failure",
				metadata: { serviceUrl: "https://api.example.com" }
			});
			expect(exception.message).toBe("External service failure");
			expect(exception.metadata).toEqual({ serviceUrl: "https://api.example.com" });
		});
	});

	describe("ExternalServiceDataValidationException", () => {
		test("should create an instance with default message", () => {
			const exception = new ExternalServiceDataValidationException();
			expect(exception).toBeInstanceOf(ExternalServiceDataValidationException);
			expect(exception.name).toBe("ExternalServiceDataValidationException");
			expect(exception.message).toBe("External service returned invalid data");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new ExternalServiceDataValidationException({
				message: "External service returned invalid data",
				metadata: { serviceUrl: "https://api.example.com", field: "email" }
			});
			expect(exception.message).toBe("External service returned invalid data");
			expect(exception.metadata).toEqual({
				serviceUrl: "https://api.example.com",
				field: "email"
			});
		});
	});

	describe("MissingArgumentException", () => {
		test("should create an instance with default message", () => {
			const exception = new MissingArgumentException();
			expect(exception).toBeInstanceOf(MissingArgumentException);
			expect(exception.name).toBe("MissingArgumentException");
			expect(exception.message).toBe("Missing argument");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new MissingArgumentException({
				message: "Missing argument",
				metadata: { argumentName: "username" }
			});
			expect(exception.message).toBe("Missing argument");
			expect(exception.metadata).toEqual({ argumentName: "username" });
		});
	});

	describe("InvalidArgumentException", () => {
		test("should create an instance with default message", () => {
			const exception = new InvalidArgumentException();
			expect(exception).toBeInstanceOf(InvalidArgumentException);
			expect(exception.name).toBe("InvalidArgumentException");
			expect(exception.message).toBe("Invalid argument");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new InvalidArgumentException({
				message: "Invalid argument",
				metadata: { argumentName: "email" }
			});
			expect(exception.message).toBe("Invalid argument");
			expect(exception.metadata).toEqual({ argumentName: "email" });
		});
	});

	describe("MissingFieldException", () => {
		test("should create an instance with default message", () => {
			const exception = new MissingFieldException();
			expect(exception).toBeInstanceOf(MissingFieldException);
			expect(exception.name).toBe("MissingFieldException");
			expect(exception.message).toBe("Missing field");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new MissingFieldException({
				message: "Missing field",
				metadata: { fieldName: "email" }
			});
			expect(exception.message).toBe("Missing field");
			expect(exception.metadata).toEqual({ fieldName: "email" });
		});
	});

	describe("InvalidFieldException", () => {
		test("should create an instance with default message", () => {
			const exception = new InvalidFieldException();
			expect(exception).toBeInstanceOf(InvalidFieldException);
			expect(exception.name).toBe("InvalidFieldException");
			expect(exception.message).toBe("Invalid field");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new InvalidFieldException({
				message: "Invalid field",
				metadata: { fieldName: "email" }
			});
			expect(exception.message).toBe("Invalid field");
			expect(exception.metadata).toEqual({ fieldName: "email" });
		});
	});

	describe("PermissionDeniedException", () => {
		test("should create an instance with default message", () => {
			const exception = new PermissionDeniedException();
			expect(exception).toBeInstanceOf(PermissionDeniedException);
			expect(exception.name).toBe("PermissionDeniedException");
			expect(exception.message).toBe("Permission denied");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new PermissionDeniedException({
				message: "Permission denied",
				metadata: { userId: "123" }
			});
			expect(exception.message).toBe("Permission denied");
			expect(exception.metadata).toEqual({ userId: "123" });
		});
	});

	describe("PreconditionFailedException", () => {
		test("should create an instance with default message", () => {
			const exception = new PreconditionFailedException();
			expect(exception).toBeInstanceOf(PreconditionFailedException);
			expect(exception.name).toBe("PreconditionFailedException");
			expect(exception.message).toBe("Precondition failed");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new PreconditionFailedException({
				message: "Precondition failed",
				metadata: { condition: "User must be logged in" }
			});
			expect(exception.message).toBe("Precondition failed");
			expect(exception.metadata).toEqual({ condition: "User must be logged in" });
		});
	});

	describe("ResourceNotFoundException", () => {
		test("should create an instance with default message", () => {
			const exception = new ResourceNotFoundException();
			expect(exception).toBeInstanceOf(ResourceNotFoundException);
			expect(exception.name).toBe("ResourceNotFoundException");
			expect(exception.message).toBe("Resource not found");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new ResourceNotFoundException({
				message: "Resource not found",
				metadata: { resourceId: "123" }
			});
			expect(exception.message).toBe("Resource not found");
			expect(exception.metadata).toEqual({ resourceId: "123" });
		});
	});

	describe("UnexpectedException", () => {
		test("should create an instance with default message", () => {
			const exception = new UnexpectedException();
			expect(exception).toBeInstanceOf(UnexpectedException);
			expect(exception.name).toBe("UnexpectedException");
			expect(exception.message).toBe("An unexpected error occurred");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new UnexpectedException({
				message: "An unexpected error occurred",
				metadata: { context: "Database operation" }
			});
			expect(exception.message).toBe("An unexpected error occurred");
			expect(exception.metadata).toEqual({ context: "Database operation" });
		});
	});

	describe("InvalidConfigurationException", () => {
		test("should create an instance with default message", () => {
			const exception = new InvalidConfigurationException();
			expect(exception).toBeInstanceOf(InvalidConfigurationException);
			expect(exception.name).toBe("InvalidConfigurationException");
			expect(exception.message).toBe("Invalid configuration");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new InvalidConfigurationException({
				message: "Invalid configuration",
				metadata: { configKey: "API_URL" }
			});
			expect(exception.message).toBe("Invalid configuration");
			expect(exception.metadata).toEqual({ configKey: "API_URL" });
		});
	});

	describe("DependencyException", () => {
		test("should create an instance with default message", () => {
			const exception = new DependencyException();
			expect(exception).toBeInstanceOf(DependencyException);
			expect(exception.name).toBe("DependencyException");
			expect(exception.message).toBe("Dependency failure");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new DependencyException({
				message: "Dependency failure",
				metadata: { dependency: "Service XYZ" }
			});
			expect(exception.message).toBe("Dependency failure");
			expect(exception.metadata).toEqual({ dependency: "Service XYZ" });
		});
	});

	describe("ControlFlowException", () => {
		test("should create an instance with default message", () => {
			const exception = new ControlFlowException();
			expect(exception).toBeInstanceOf(ControlFlowException);
			expect(exception.name).toBe("ControlFlowException");
			expect(exception.message).toBe("Control flow interruption");
		});

		test("should create an instance with provided message and metadata", () => {
			const exception = new ControlFlowException({
				message: "Dry run completed, transaction rolled back",
				metadata: { operation: "syncTaskProviderTasks" }
			});
			expect(exception.message).toBe("Dry run completed, transaction rolled back");
			expect(exception.metadata).toEqual({ operation: "syncTaskProviderTasks" });
		});
	});
});
