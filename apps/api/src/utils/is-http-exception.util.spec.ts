import { describe, expect, it } from "vitest";

import { BadRequestException, HttpException } from "$exceptions/http.exception";

import { isHttpException } from "./is-http-exception.util";

describe("isHttpException", () => {
	it("should return true for HttpException instances", () => {
		const error = new HttpException(400, { errorCode: "VALIDATION_ERROR" });
		expect(isHttpException(error)).toBe(true);
	});

	it("should return true for subclasses of HttpException", () => {
		const error = new BadRequestException();
		expect(isHttpException(error)).toBe(true);
	});

	it("should return false for non-HttpException errors", () => {
		const error = new Error("Regular error");
		expect(isHttpException(error)).toBe(false);
	});

	it("should return false for non-error values", () => {
		expect(isHttpException("string")).toBe(false);
		expect(isHttpException(42)).toBe(false);
		expect(isHttpException(null)).toBe(false);
		expect(isHttpException(undefined)).toBe(false);
		expect(isHttpException({})).toBe(false);
	});
});
