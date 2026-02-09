/**
 * Discord OAuth utilities using Arctic library
 * Handles OAuth flow with Discord (authorization URL generation, code exchange, profile fetching)
 */

import type { Env } from "$env";
import { Discord, generateCodeVerifier, generateState } from "arctic";

import { BadRequestException, ServiceUnavailableException } from "$exceptions/http.exception";

import type { DiscordProfile } from "../auth.types";

// ============================================================================
// Types
// ============================================================================

/**
 * Discord tokens returned from OAuth code exchange
 */
export interface DiscordTokens {
	accessToken: string;
	refreshToken: string | null;
	expiresAt: Date | null;
}

/**
 * Input for exchanging authorization code for tokens
 */
export interface ExchangeCodeInput {
	code: string;
	codeVerifier: string;
}

/**
 * Authorization URL generation result
 */
export interface AuthUrlResult {
	authUrl: string;
	state: string;
	codeVerifier: string;
}

// ============================================================================
// Functions
// ============================================================================

/**
 * Create Discord OAuth client from environment
 */
function createClient(env: Env): Discord {
	return new Discord(
		env.DISCORD_CLIENT_ID,
		env.DISCORD_CLIENT_SECRET,
		env.DISCORD_OAUTH_REDIRECT_URL
	);
}

/**
 * Generate Discord OAuth authorization URL with PKCE
 *
 * @param env - Environment bindings
 * @returns Authorization URL, state token, and code verifier
 */
export function generateAuthUrl(env: Env): AuthUrlResult {
	const client = createClient(env);
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = client.createAuthorizationURL(state, codeVerifier, ["identify", "email", "guilds"]);

	return {
		authUrl: url.toString(),
		state,
		codeVerifier
	};
}

/**
 * Exchange authorization code for Discord tokens
 *
 * @param env - Environment bindings
 * @param input - Code and code verifier from OAuth callback
 * @returns Discord access token, refresh token, and expiry
 */
export async function exchangeCode(env: Env, input: ExchangeCodeInput): Promise<DiscordTokens> {
	const client = createClient(env);
	const tokens = await client.validateAuthorizationCode(input.code, input.codeVerifier);

	return {
		accessToken: tokens.accessToken(),
		refreshToken: tokens.hasRefreshToken() ? tokens.refreshToken() : null,
		expiresAt: tokens.accessTokenExpiresAt()
	};
}

/**
 * Fetch Discord user profile using access token
 *
 * @param accessToken - Discord access token
 * @returns Discord user profile
 */
export async function fetchProfile(accessToken: string): Promise<DiscordProfile> {
	const response = await fetch("https://discord.com/api/users/@me", {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		throw new ServiceUnavailableException();
	}

	const data = (await response.json()) as unknown;

	if (!isDiscordProfileResponse(data)) {
		throw new BadRequestException({ errorCode: "INVALID_INPUT" });
	}

	return {
		id: data.id,
		username: data.username,
		discriminator: data.discriminator || "0",
		avatar: data.avatar,
		email: data.email || null,
		verified: data.verified ?? false,
		locale: data.locale || "en"
	};
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Type guard for Discord API response
 */
function isDiscordProfileResponse(data: unknown): data is {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	email?: string;
	verified?: boolean;
	locale?: string;
} {
	const d = data as Partial<{
		id: string;
		username: string;
		discriminator: string;
		avatar: string | null;
		email: string;
		verified: boolean;
		locale: string;
	}>;

	return (
		!!d &&
		typeof d.id === "string" &&
		typeof d.username === "string" &&
		typeof d.discriminator === "string" &&
		(d.avatar === null || typeof d.avatar === "string")
	);
}
