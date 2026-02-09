/**
 * Token generation and validation service
 * Uses jose-based JWT utilities for access and refresh token management
 */

import type { Env } from "$env";

import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "@moolah/domain/auth";

import type { AccessTokenPayload, RefreshTokenPayload } from "./auth.types";
import { signJwt, verifyJwt } from "./utils/jwt";

/**
 * Generate an access token (short-lived, 15 minutes)
 *
 * @param env - Environment bindings
 * @param payload - User data to encode (sub, discordId, role)
 * @returns Signed JWT access token
 */
export async function generateAccessToken(
	env: Env,
	payload: Pick<AccessTokenPayload, "sub" | "discordId" | "role">
): Promise<string> {
	const fullPayload: Omit<AccessTokenPayload, "iat" | "exp"> = {
		...payload,
		type: "access"
	};

	return signJwt(env.JWT_SECRET, fullPayload, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

/**
 * Generate a refresh token (long-lived, 7 days)
 *
 * @param env - Environment bindings
 * @param payload - User ID, token ID, and intent (client/admin)
 * @returns Signed JWT refresh token
 */
export async function generateRefreshToken(
	env: Env,
	payload: Pick<RefreshTokenPayload, "sub" | "tokenId" | "intent">
): Promise<string> {
	const fullPayload: Omit<RefreshTokenPayload, "iat" | "exp"> = {
		...payload,
		type: "refresh"
	};

	return signJwt(env.JWT_SECRET, fullPayload, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

/**
 * Validate an access token
 *
 * @param env - Environment bindings
 * @param token - JWT access token to validate
 * @returns Validation result with payload if valid
 */
export async function validateAccessToken(
	env: Env,
	token: string
): Promise<{ valid: true; payload: AccessTokenPayload } | { valid: false; reason: string }> {
	const result = await verifyJwt<AccessTokenPayload>(env.JWT_SECRET, token);

	if (!result.valid) {
		return { valid: false, reason: result.reason };
	}

	if (result.payload.type !== "access") {
		return { valid: false, reason: "Invalid token type" };
	}

	return { valid: true, payload: result.payload };
}

/**
 * Validate a refresh token (JWT only, not database check)
 *
 * @param env - Environment bindings
 * @param token - JWT refresh token to validate
 * @param expectedIntent - Expected token intent (client or admin)
 * @returns Validation result with payload if valid
 */
export async function validateRefreshToken(
	env: Env,
	token: string,
	expectedIntent: "client" | "admin" = "client"
): Promise<{ valid: true; payload: RefreshTokenPayload } | { valid: false; reason: string }> {
	const result = await verifyJwt<RefreshTokenPayload>(env.JWT_SECRET, token);

	if (!result.valid) {
		return { valid: false, reason: result.reason };
	}

	if (result.payload.type !== "refresh") {
		return { valid: false, reason: "Invalid token type" };
	}

	if (result.payload.intent !== expectedIntent) {
		return {
			valid: false,
			reason: `Invalid token intent: expected ${expectedIntent}, got ${result.payload.intent}`
		};
	}

	return { valid: true, payload: result.payload };
}
