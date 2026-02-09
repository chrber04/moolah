import { describe, expect, it } from "vitest";

import { InternalException } from "$exceptions/internal.exception.js";

import { isInternalException } from "./is-internal-exception.util.js";

describe("isInternalException", () => {
	it("should return true for InternalException instances", () => {
		const error = new InternalException("Test error");
		expect(isInternalException(error)).toBe(true);
	});

	it("should return true for InternalException with all options", () => {
		const error = new InternalException("Test error", {
			cause: new Error("Cause"),
			metadata: { test: "data" },
			context: { source: "TestService" },
			tags: ["test"]
		});
		expect(isInternalException(error)).toBe(true);
	});

	it("should return false for non-InternalException errors", () => {
		const error = new Error("Regular error");
		expect(isInternalException(error)).toBe(false);
	});

	it("should return false for non-error values", () => {
		expect(isInternalException("string")).toBe(false);
		expect(isInternalException(42)).toBe(false);
		expect(isInternalException(null)).toBe(false);
		expect(isInternalException(undefined)).toBe(false);
		expect(isInternalException({})).toBe(false);
	});
});
