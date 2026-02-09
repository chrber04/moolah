/**
 * Client auth service - client-facing authentication operations
 * Handles Discord OAuth, session management, and token refresh for clients
 */

import type { DiscordGuild } from "@moolah/contract/discord";
import type { DeviceInfo } from "@moolah/domain/auth";

import type { RequestContext } from "$lib/context";

import * as authService from "./auth.service";
import * as refreshTokenService from "./refresh-token.service";
import * as tokenService from "./token.service";
import * as discordOAuth from "./utils/discord-oauth";

// Discord permission bit for MANAGE_GUILD
const MANAGE_GUILD_PERMISSION = 0x20n;

/**
 * Raw Discord guild response from API
 */
interface DiscordApiGuild {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: string;
}

/**
 * Fetch user's Discord guilds where they have MANAGE_GUILD permission
 * Called immediately after OAuth to cache guilds
 */
async function fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
	const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		console.error(`Discord API error fetching guilds: ${response.status}`);
		return [];
	}

	const guilds = (await response.json()) as DiscordApiGuild[];

	// Filter to guilds where user has MANAGE_GUILD permission or is owner
	return guilds
		.filter((guild) => {
			const permissions = BigInt(guild.permissions);
			return (permissions & MANAGE_GUILD_PERMISSION) === MANAGE_GUILD_PERMISSION || guild.owner;
		})
		.map((guild) => ({
			id: guild.id,
			name: guild.name,
			icon: guild.icon,
			owner: guild.owner,
			permissions: guild.permissions
		}));
}

// ============================================================================
// OAuth Flow
// ============================================================================

/**
 * Initiate Discord OAuth flow for clients
 * Generates authorization URL with PKCE parameters
 *
 * @param ctx - Request context
 * @returns Authorization URL, state, and code verifier
 */
export async function initiateDiscordOAuth(ctx: RequestContext) {
	return discordOAuth.generateAuthUrl(ctx.env);
}

/**
 * Handle Discord OAuth callback for clients
 * Completes authentication flow and issues client tokens
 *
 * @param ctx - Request context
 * @param code - Authorization code from Discord
 * @param codeVerifier - PKCE code verifier
 * @param deviceInfo - Optional device tracking info
 * @returns Access token, refresh token, and user data
 */
export async function handleDiscordCallback(
	ctx: RequestContext,
	code: string,
	codeVerifier: string,
	deviceInfo?: DeviceInfo
) {
	// Exchange code for Discord tokens
	const discordTokens = await discordOAuth.exchangeCode(ctx.env, { code, codeVerifier });

	// Fetch Discord profile and guilds in parallel
	const [profile, guilds] = await Promise.all([
		discordOAuth.fetchProfile(discordTokens.accessToken),
		fetchUserGuilds(discordTokens.accessToken)
	]);

	// Find or create user and cache their guilds
	const user = await authService.findOrCreateUser(ctx, profile, guilds);

	// Generate client token pair (shared logic)
	const { accessToken, refreshToken } = await authService.generateTokenPair(
		ctx,
		user,
		"client",
		deviceInfo
	);

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
 * Validate client access token
 *
 * @param ctx - Request context
 * @param token - Access token to validate
 * @returns Validation result
 */
export async function validateAccessToken(ctx: RequestContext, token: string) {
	return tokenService.validateAccessToken(ctx.env, token);
}

/**
 * Refresh client access token using refresh token (token rotation)
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
	return authService.rotateRefreshToken(ctx, refreshToken, "client", deviceInfo);
}

// ============================================================================
// Session Management
// ============================================================================

/**
 * Revoke client session (logout from single device)
 *
 * @param ctx - Request context
 * @param refreshToken - Refresh token to revoke
 * @returns Success status
 */
export async function revokeSession(ctx: RequestContext, refreshToken: string) {
	return authService.revokeRefreshToken(ctx, refreshToken, "client");
}

/**
 * Revoke all client sessions for a user (logout from all devices)
 *
 * @param ctx - Request context
 * @param userId - User ID
 * @returns Number of sessions revoked
 */
export async function revokeAllSessions(ctx: RequestContext, userId: string) {
	const revokedCount = await refreshTokenService.revokeAllUserTokens(ctx, userId);
	return { revokedCount };
}

/**
 * Get all active client sessions for a user
 *
 * @param ctx - Request context
 * @param userId - User ID
 * @returns Array of active sessions
 */
export async function getUserSessions(ctx: RequestContext, userId: string) {
	return refreshTokenService.getUserSessions(ctx, userId);
}
