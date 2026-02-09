/**
 * Refresh token database operations
 * Manages refresh token lifecycle (create, find, revoke, cleanup)
 */

import { and, eq, gt, isNull } from "drizzle-orm";

import type { DeviceInfo } from "@moolah/domain/auth";
import { refreshTokens } from "@moolah/database";

import type { RequestContext } from "$lib/context";

import { generateSecureToken } from "./utils/jwt";

/**
 * Create a new refresh token in the database
 *
 * @param ctx - Request context
 * @param userId - User ID
 * @param expiresAt - Expiration date
 * @param intent - Token intent (client or admin)
 * @param deviceInfo - Optional device tracking info
 * @returns Token ID
 */
export async function createRefreshToken(
	ctx: RequestContext,
	userId: string,
	expiresAt: Date,
	intent: "client" | "admin",
	deviceInfo?: DeviceInfo
): Promise<string> {
	const tokenId = generateSecureToken(32);

	await ctx.db.insert(refreshTokens).values({
		id: tokenId,
		userId,
		intent,
		expiresAt,
		userAgent: deviceInfo?.userAgent,
		ipAddress: deviceInfo?.ipAddress,
		deviceName: deviceInfo?.deviceName
	});

	return tokenId;
}

/**
 * Find a valid refresh token by ID
 * Returns null if token is revoked or expired
 *
 * @param ctx - Request context
 * @param tokenId - Token ID from JWT
 * @returns Token data or null if not found/expired/revoked
 */
export async function findRefreshToken(ctx: RequestContext, tokenId: string) {
	const now = new Date();

	const [token] = await ctx.db
		.select()
		.from(refreshTokens)
		.where(
			and(
				eq(refreshTokens.id, tokenId),
				isNull(refreshTokens.revokedAt),
				gt(refreshTokens.expiresAt, now)
			)
		)
		.limit(1);

	return token || null;
}

/**
 * Revoke a refresh token (soft delete)
 *
 * @param ctx - Request context
 * @param tokenId - Token ID to revoke
 * @returns True if token was revoked, false if not found
 */
export async function revokeRefreshToken(ctx: RequestContext, tokenId: string): Promise<boolean> {
	const result = await ctx.db
		.update(refreshTokens)
		.set({ revokedAt: new Date() })
		.where(eq(refreshTokens.id, tokenId))
		.returning({ id: refreshTokens.id });

	return result.length > 0;
}

/**
 * Revoke all refresh tokens for a user (logout from all devices)
 *
 * @param ctx - Request context
 * @param userId - User ID
 * @returns Number of tokens revoked
 */
export async function revokeAllUserTokens(ctx: RequestContext, userId: string): Promise<number> {
	const result = await ctx.db
		.update(refreshTokens)
		.set({ revokedAt: new Date() })
		.where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)))
		.returning({ id: refreshTokens.id });

	return result.length;
}

/**
 * Update last used timestamp for a token
 *
 * @param ctx - Request context
 * @param tokenId - Token ID
 */
export async function updateLastUsed(ctx: RequestContext, tokenId: string): Promise<void> {
	await ctx.db
		.update(refreshTokens)
		.set({ lastUsedAt: new Date() })
		.where(eq(refreshTokens.id, tokenId));
}

/**
 * Get all active sessions for a user (for "Active Devices" UI)
 *
 * @param ctx - Request context
 * @param userId - User ID
 * @returns Array of active sessions
 */
export async function getUserSessions(ctx: RequestContext, userId: string) {
	const now = new Date();

	return ctx.db
		.select({
			id: refreshTokens.id,
			deviceName: refreshTokens.deviceName,
			userAgent: refreshTokens.userAgent,
			ipAddress: refreshTokens.ipAddress,
			createdAt: refreshTokens.createdAt,
			lastUsedAt: refreshTokens.lastUsedAt,
			expiresAt: refreshTokens.expiresAt
		})
		.from(refreshTokens)
		.where(
			and(
				eq(refreshTokens.userId, userId),
				isNull(refreshTokens.revokedAt),
				gt(refreshTokens.expiresAt, now)
			)
		)
		.orderBy(refreshTokens.createdAt);
}
