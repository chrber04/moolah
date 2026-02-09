/**
 * JWT utilities using jose library
 * Handles JWT signing, verification, and decoding for server environments
 *
 */

import type { JWTPayload } from "jose";
import { decodeJwt, errors, jwtVerify, SignJWT } from "jose";

// ============================================================================
// Types
// ============================================================================

/**
 * Options for signing a JWT
 */
export interface SignJwtOptions {
	/**
	 * Token expiration time in seconds from now
	 * @example 900 // 15 minutes
	 */
	expiresIn?: number;
	/**
	 * Subject claim - typically the user ID
	 */
	subject?: string;
	/**
	 * Audience claim - identifies intended recipients
	 */
	audience?: string | string[];
	/**
	 * Issuer claim - identifies the principal that issued the JWT
	 */
	issuer?: string;
	/**
	 * Unique identifier for the JWT
	 */
	jwtId?: string;
}

/**
 * Options for verifying a JWT
 */
export interface VerifyJwtOptions {
	/**
	 * Expected audience(s)
	 */
	audience?: string | string[];
	/**
	 * Expected issuer
	 */
	issuer?: string;
	/**
	 * Clock tolerance in seconds for expiration checks
	 * @default 0
	 */
	clockTolerance?: number;
}

/**
 * Successful JWT verification result
 */
export interface JwtVerifySuccess<T> {
	valid: true;
	payload: T;
}

/**
 * Failed JWT verification result
 */
export interface JwtVerifyFailure {
	valid: false;
	reason: string;
	code: "expired" | "invalid_signature" | "malformed" | "validation_error";
}

/**
 * JWT verification result (discriminated union)
 */
export type JwtVerifyResult<T> = JwtVerifySuccess<T> | JwtVerifyFailure;

// ============================================================================
// Functions
// ============================================================================

const encoder = new TextEncoder();

/**
 * Sign a JWT with HS256 algorithm
 *
 * @param secret - JWT secret key
 * @param payload - Data to encode in JWT
 * @param options - Signing options
 * @returns Signed JWT string
 */
export async function signJwt<T extends Record<string, unknown>>(
	secret: string,
	payload: T,
	options: SignJwtOptions = {}
): Promise<string> {
	const { expiresIn, subject, audience, issuer, jwtId } = options;
	const secretKey = encoder.encode(secret);

	const jwt = new SignJWT(payload as unknown as JWTPayload).setProtectedHeader({
		alg: "HS256",
		typ: "JWT"
	});

	jwt.setIssuedAt();

	if (expiresIn !== undefined) {
		jwt.setExpirationTime(`${expiresIn}s`);
	}
	if (subject) jwt.setSubject(subject);
	if (audience) jwt.setAudience(audience);
	if (issuer) jwt.setIssuer(issuer);
	if (jwtId) jwt.setJti(jwtId);

	return jwt.sign(secretKey);
}

/**
 * Verify and decode a JWT
 *
 * @param secret - JWT secret key
 * @param token - JWT string to verify
 * @param options - Verification options
 * @returns Verification result with payload if valid
 */
export async function verifyJwt<T>(
	secret: string,
	token: string,
	options: VerifyJwtOptions = {}
): Promise<JwtVerifyResult<T>> {
	const secretKey = encoder.encode(secret);

	try {
		const { payload } = await jwtVerify<T>(token, secretKey, {
			algorithms: ["HS256"],
			audience: options.audience,
			issuer: options.issuer,
			clockTolerance: options.clockTolerance
		});

		return { valid: true, payload };
	} catch (error) {
		if (error instanceof errors.JWTExpired) {
			return { valid: false, reason: "Token expired", code: "expired" };
		}
		if (error instanceof errors.JWSSignatureVerificationFailed) {
			return { valid: false, reason: "Invalid signature", code: "invalid_signature" };
		}
		if (error instanceof errors.JWTInvalid || error instanceof errors.JWTClaimValidationFailed) {
			return { valid: false, reason: "Token malformed or invalid claims", code: "malformed" };
		}

		return {
			valid: false,
			reason: error instanceof Error ? error.message : "Token verification failed",
			code: "validation_error"
		};
	}
}

/**
 * Decode a JWT without verification
 *
 * @warning This does NOT verify the signature! Use only for debugging.
 * @param token - JWT string to decode
 * @returns Decoded payload or null if malformed
 */
export function decodeJwtUnsafe<T>(token: string): T | null {
	try {
		return decodeJwt(token) as T;
	} catch {
		return null;
	}
}
