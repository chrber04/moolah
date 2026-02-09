/**
 * Auth types - API-specific authentication types
 * These are implementation details of the API, not shared with the frontend
 *
 * Note: ACCESS_TOKEN_EXPIRY and REFRESH_TOKEN_EXPIRY are in @moolah/core/auth
 * because they're shared with the frontend for cookie maxAge settings.
 *
 */

import type { UserRole } from "@moolah/domain/user";

// ============================================================================
// JWT Configuration
// ============================================================================

/**
 * JWT signing algorithm
 * @default "HS256" (HMAC with SHA-256)
 */
export const JWT_ALGORITHM = "HS256";

// ============================================================================
// Discord OAuth Types
// ============================================================================

/**
 * Discord user profile data returned from OAuth
 */
export interface DiscordProfile {
	/** Discord user ID (snowflake) */
	id: string;
	/** Discord username */
	username: string;
	/** Discord discriminator (legacy, now "0" for most users) */
	discriminator: string;
	/** Discord avatar hash (null if no avatar) */
	avatar: string | null;
	/** Discord email (null if not shared) */
	email: string | null;
	/** Email verification status from Discord */
	verified: boolean;
	/** Discord user locale (e.g., "en-US") */
	locale: string;
}

// ============================================================================
// JWT Token Payloads
// ============================================================================

/**
 * Refresh token intent - distinguishes admin vs client tokens
 */
export type RefreshTokenIntent = "client" | "admin";

/**
 * Access token JWT payload
 * Short-lived (15 min), contains user identity and role
 */
export interface AccessTokenPayload {
	/** User ID */
	sub: string;
	/** Discord user ID */
	discordId: string;
	/** User role for authorization */
	role: UserRole;
	/** Token type identifier */
	type: "access";
	/** Issued at (Unix timestamp) */
	iat: number;
	/** Expires at (Unix timestamp) */
	exp: number;
}

/**
 * Refresh token JWT payload
 * Long-lived (7 days), references database token ID
 */
export interface RefreshTokenPayload {
	/** User ID */
	sub: string;
	/** Refresh token ID in database (for revocation) */
	tokenId: string;
	/** Token type identifier */
	type: "refresh";
	/** Intent - client or admin token */
	intent: RefreshTokenIntent;
	/** Issued at (Unix timestamp) */
	iat: number;
	/** Expires at (Unix timestamp) */
	exp: number;
}
