import type { DeviceInfo } from "@moolah/domain/auth";
import { UserRole } from "@moolah/domain/user";

import type { RequestContext } from "$lib/context";
import { ForbiddenException } from "$exceptions/http.exception";

import * as authService from "./auth.service";
import * as refreshTokenService from "./refresh-token.service";
import * as tokenService from "./token.service";
import * as discordOAuth from "./utils/discord-oauth";

// ============================================================================
// Constants
// ============================================================================

/** Roles that are allowed to use admin authentication */
const ADMIN_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

// ============================================================================
// OAuth Flow
// ============================================================================

/**
 * Initiate Discord OAuth flow for admins
 * Uses the same OAuth flow but will issue admin-intent tokens
 *
 * @param ctx - Request context
 * @returns Authorization URL, state, and code verifier
 */
export async function initiateDiscordOAuth(ctx: RequestContext) {
	return discordOAuth.generateAuthUrl(ctx.env);
}

/**
 * Handle Discord OAuth callback for admins
 * Verifies user has admin role before issuing admin tokens
 *
 * @param ctx - Request context
 * @param code - Authorization code from Discord
 * @param codeVerifier - PKCE code verifier
 * @param deviceInfo - Optional device tracking info
 * @returns Access token, refresh token, and user data or error
 */
export async function handleDiscordCallback(
	ctx: RequestContext,
	code: string,
	codeVerifier: string,
	deviceInfo?: DeviceInfo
) {
	ctx.log.info("Admin OAuth callback started", { tags: ["auth"] });

	// Exchange code for Discord tokens
	const discordTokens = await discordOAuth.exchangeCode(ctx.env, { code, codeVerifier });
	ctx.log.debug("Discord tokens exchanged", { tags: ["auth", "discord"] });

	// Fetch Discord profile
	const profile = await discordOAuth.fetchProfile(discordTokens.accessToken);
	ctx.log.debug("Discord profile fetched", {
		metadata: { discordId: profile.id },
		tags: ["auth", "discord"]
	});

	// Find or create user (shared logic)
	// Admin OAuth doesn't cache guilds (not needed for admin panel)
	const user = await authService.findOrCreateUser(ctx, profile);

	// CRITICAL: Verify user has admin role
	if (!ADMIN_ROLES.includes(user.role as UserRole)) {
		ctx.log.warn("Non-admin attempted admin login", {
			metadata: { userId: user.id, role: user.role, discordId: profile.id },
			tags: ["auth", "admin", "security"]
		});
		throw new ForbiddenException({
			i18n: { key: "error_forbidden_reason", params: { reason: "Admin access required" } }
		});
	}

	// Generate admin token pair (shared logic with admin intent)
	const { accessToken, refreshToken } = await authService.generateTokenPair(
		ctx,
		user,
		"admin",
		deviceInfo
	);

	ctx.log.info("Admin login successful", {
		metadata: { userId: user.id },
		tags: ["auth", "admin"]
	});

	return {
		accessToken,
		refreshToken,
		user: {
			id: user.id,
			discordId: user.discordId,
			role: user.role,
			displayName: user.displayName,
			avatarUrl: user.avatarUrl,
			email: user.email
		}
	};
}

// ============================================================================
// Token Management
// ============================================================================

/**
 * Validate admin access token
 * Same validation as client, but could add admin-specific checks
 *
 * @param ctx - Request context
 * @param token - Access token to validate
 * @returns Validation result
 */
export async function validateAccessToken(ctx: RequestContext, token: string) {
	const result = await tokenService.validateAccessToken(ctx.env, token);

	// Additional admin-specific validation: verify role
	if (result.valid) {
		if (!ADMIN_ROLES.includes(result.payload.role as UserRole)) {
			return { valid: false as const, reason: "Access denied: Admin role required" };
		}
	}

	return result;
}

/**
 * Refresh admin access token using refresh token (token rotation)
 *
 * @param ctx - Request context
 * @param refreshToken - Current refresh token
 * @param deviceInfo - Optional device tracking info
 * @returns New tokens or error
 */
export async function refreshAccessToken(
	ctx: RequestContext,
	refreshToken: string,
	deviceInfo?: DeviceInfo
) {
	return authService.rotateRefreshToken(ctx, refreshToken, "admin", deviceInfo);
}

// ============================================================================
// Session Management (Admin's own sessions)
// ============================================================================

/**
 * Revoke admin session (logout from single device)
 *
 * @param ctx - Request context
 * @param refreshToken - Refresh token to revoke
 * @returns Success status
 */
export async function revokeSession(ctx: RequestContext, refreshToken: string) {
	return authService.revokeRefreshToken(ctx, refreshToken, "admin");
}

// ============================================================================
// Admin-Only Operations (manage other users' sessions)
// ============================================================================

/**
 * Get all active sessions for any user (admin operation)
 *
 * @param ctx - Request context
 * @param userId - Target user ID
 * @returns Array of active sessions
 */
export async function getAnyUserSessions(ctx: RequestContext, userId: string) {
	return refreshTokenService.getUserSessions(ctx, userId);
}

/**
 * Revoke a specific session by token ID (admin operation)
 * Admin can revoke any user's session directly by ID
 *
 * @param ctx - Request context
 * @param tokenId - Refresh token ID to revoke
 * @returns Success status
 */
export async function revokeAnyUserSession(ctx: RequestContext, tokenId: string) {
	const result = await refreshTokenService.revokeRefreshToken(ctx, tokenId);
	return { success: result };
}

/**
 * Revoke all sessions for any user (admin operation)
 *
 * @param ctx - Request context
 * @param userId - Target user ID
 * @returns Number of sessions revoked
 */
export async function revokeAllUserSessions(ctx: RequestContext, userId: string) {
	const revokedCount = await refreshTokenService.revokeAllUserTokens(ctx, userId);
	return { revokedCount };
}
