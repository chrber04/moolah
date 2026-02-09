/**
 * Shared auth service - business logic used by both client and admin
 * Contains user management, token generation, and session utilities
 */

import { eq } from "drizzle-orm";

import type { DiscordGuild } from "@moolah/contract/discord";
import type { DeviceInfo } from "@moolah/domain/auth";
import type { UserRole } from "@moolah/domain/user";
import { users } from "@moolah/database";
import { REFRESH_TOKEN_EXPIRY } from "@moolah/domain/auth";

import type { RequestContext } from "$lib/context";

import type { DiscordProfile, RefreshTokenIntent } from "./auth.types";
import * as refreshTokenService from "./refresh-token.service";
import * as tokenService from "./token.service";
import { generateSecureToken } from "./utils/jwt";

// ============================================================================
// User Management
// ============================================================================

/**
 * Find existing user or create new one from Discord profile
 * Used by both client and admin OAuth flows
 *
 * @param ctx - Request context
 * @param profile - Discord user profile
 * @param guilds - User's Discord guilds to cache (optional, fetched during OAuth)
 * @returns User data
 */
export async function findOrCreateUser(
	ctx: RequestContext,
	profile: DiscordProfile,
	guilds?: DiscordGuild[]
) {
	// Try to find existing user by Discord ID
	const [existingUser] = await ctx.db
		.select()
		.from(users)
		.where(eq(users.discordId, profile.id))
		.limit(1);

	if (existingUser) {
		// Update user profile (in case Discord data changed) and cache guilds
		await ctx.db
			.update(users)
			.set({
				displayName: profile.username,
				avatarUrl: profile.avatar
					? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
					: null,
				email: profile.email,
				emailIsVerified: profile.verified,
				// Cache guilds if provided
				...(guilds && {
					discordGuilds: JSON.stringify(guilds),
					discordGuildsUpdatedAt: new Date()
				}),
				updatedAt: new Date()
			})
			.where(eq(users.id, existingUser.id));

		return {
			...existingUser,
			email: profile.email
		};
	}

	// Create new user
	const userId = generateSecureToken(16);
	const avatarUrl = profile.avatar
		? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
		: null;

	await ctx.db.insert(users).values({
		id: userId,
		discordId: profile.id,
		displayName: profile.username,
		avatarUrl,
		email: profile.email,
		emailIsVerified: profile.verified,
		role: "REGULAR",
		// Cache guilds if provided
		...(guilds && {
			discordGuilds: JSON.stringify(guilds),
			discordGuildsUpdatedAt: new Date()
		})
	});

	return {
		id: userId,
		discordId: profile.id,
		displayName: profile.username,
		avatarUrl,
		email: profile.email,
		role: "REGULAR" as const
	};
}

/**
 * Get user by ID
 *
 * @param ctx - Request context
 * @param userId - User ID
 * @returns User data or null
 */
export async function getUserById(ctx: RequestContext, userId: string) {
	const [user] = await ctx.db.select().from(users).where(eq(users.id, userId)).limit(1);
	return user || null;
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate access and refresh token pair
 * Used after successful OAuth or token refresh
 *
 * @param ctx - Request context
 * @param user - User data
 * @param intent - Token intent (client or admin)
 * @param deviceInfo - Optional device tracking info
 * @returns Access token, refresh token, and token ID
 */
export async function generateTokenPair(
	ctx: RequestContext,
	user: { id: string; discordId: string; role: UserRole },
	intent: RefreshTokenIntent,
	deviceInfo?: DeviceInfo
) {
	// Create refresh token in database
	const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000);
	const refreshTokenId = await refreshTokenService.createRefreshToken(
		ctx,
		user.id,
		refreshTokenExpiresAt,
		intent,
		deviceInfo
	);

	// Generate JWT tokens
	const accessToken = await tokenService.generateAccessToken(ctx.env, {
		sub: user.id,
		discordId: user.discordId,
		role: user.role
	});

	const refreshToken = await tokenService.generateRefreshToken(ctx.env, {
		sub: user.id,
		tokenId: refreshTokenId,
		intent
	});

	return {
		accessToken,
		refreshToken,
		refreshTokenId
	};
}

// ============================================================================
// Token Rotation
// ============================================================================

/**
 * Rotate refresh token (revoke old, create new)
 * Used by both client and admin token refresh flows
 *
 * @param ctx - Request context
 * @param refreshToken - Current refresh token JWT
 * @param expectedIntent - Expected token intent
 * @param deviceInfo - Optional device tracking info
 * @returns New tokens or error
 */
export async function rotateRefreshToken(
	ctx: RequestContext,
	refreshToken: string,
	expectedIntent: RefreshTokenIntent,
	deviceInfo?: DeviceInfo
) {
	// Validate refresh token JWT
	const validation = await tokenService.validateRefreshToken(ctx.env, refreshToken, expectedIntent);
	if (!validation.valid) {
		return { success: false as const, reason: validation.reason };
	}

	const { tokenId, sub: userId, intent } = validation.payload;

	// Check if refresh token exists in DB and is not revoked
	const dbToken = await refreshTokenService.findRefreshToken(ctx, tokenId);
	if (!dbToken) {
		return { success: false as const, reason: "Refresh token not found or expired" };
	}

	// Verify database token intent matches JWT token intent
	if (dbToken.intent !== intent) {
		return { success: false as const, reason: "Token intent mismatch" };
	}

	// Get user
	const user = await getUserById(ctx, userId);
	if (!user) {
		return { success: false as const, reason: "User not found" };
	}

	// Revoke old refresh token (rotation)
	await refreshTokenService.revokeRefreshToken(ctx, tokenId);

	// Create new token pair with same intent
	const effectiveDeviceInfo = deviceInfo || {
		userAgent: dbToken.userAgent || undefined,
		ipAddress: dbToken.ipAddress || undefined,
		deviceName: dbToken.deviceName || undefined
	};

	const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair(
		ctx,
		user,
		intent,
		effectiveDeviceInfo
	);

	return {
		success: true as const,
		accessToken,
		refreshToken: newRefreshToken
	};
}

// ============================================================================
// Session Revocation
// ============================================================================

/**
 * Revoke a refresh token by validating and extracting token ID
 * Used by both client and admin logout flows
 *
 * @param ctx - Request context
 * @param refreshToken - Refresh token JWT
 * @param expectedIntent - Expected token intent
 * @returns Success status
 */
export async function revokeRefreshToken(
	ctx: RequestContext,
	refreshToken: string,
	expectedIntent: RefreshTokenIntent
) {
	const validation = await tokenService.validateRefreshToken(ctx.env, refreshToken, expectedIntent);
	if (!validation.valid) {
		return { success: false };
	}

	const { tokenId } = validation.payload;
	await refreshTokenService.revokeRefreshToken(ctx, tokenId);

	return { success: true };
}
