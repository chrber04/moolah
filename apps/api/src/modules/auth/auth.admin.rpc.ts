import type { Env } from "$env";
import { RpcTarget } from "cloudflare:workers";

import type {
	GetAnyUserSessionsInput,
	GetAnyUserSessionsOutput,
	HandleAdminDiscordCallbackInput,
	HandleAdminDiscordCallbackOutput,
	InitiateAdminDiscordOAuthOutput,
	RefreshAdminAccessTokenInput,
	RefreshAdminAccessTokenOutput,
	RevokeAdminSessionInput,
	RevokeAdminSessionOutput,
	RevokeAllUserSessionsInput,
	RevokeAllUserSessionsOutput,
	RevokeAnyUserSessionInput,
	RevokeAnyUserSessionOutput,
	ValidateAdminAccessTokenInput,
	ValidateAdminAccessTokenOutput
} from "@moolah/contract-admin/auth";
import type { AdminRequestContext } from "@moolah/contract-admin/context";
import type { RpcResult } from "@moolah/core/rpc";

import { createRpcHandler } from "$lib/rpc";

import * as authAdminService from "./auth.admin.service";

export class AuthAdminRpcTarget extends RpcTarget {
	private rpc: ReturnType<typeof createRpcHandler>;

	constructor(env: Env) {
		super();
		this.rpc = createRpcHandler(env);
	}

	/**
	 * Initiate Discord OAuth flow for admins
	 * Generates authorization URL with PKCE parameters
	 */
	async initiateDiscordOAuth(
		ctx: AdminRequestContext
	): Promise<RpcResult<InitiateAdminDiscordOAuthOutput>> {
		return this.rpc(ctx, (c) => authAdminService.initiateDiscordOAuth(c));
	}

	/**
	 * Handle Discord OAuth callback for admins
	 * Verifies admin role before issuing tokens
	 */
	async handleDiscordCallback(
		ctx: AdminRequestContext,
		input: HandleAdminDiscordCallbackInput
	): Promise<RpcResult<HandleAdminDiscordCallbackOutput>> {
		return this.rpc(ctx, (c) =>
			authAdminService.handleDiscordCallback(c, input.code, input.codeVerifier, {
				userAgent: input.userAgent,
				ipAddress: input.ipAddress
			})
		);
	}

	/**
	 * Validate an admin access token
	 * Additionally verifies the user has admin role
	 */
	async validateAccessToken(
		ctx: AdminRequestContext,
		input: ValidateAdminAccessTokenInput
	): Promise<RpcResult<ValidateAdminAccessTokenOutput>> {
		return this.rpc(ctx, (c) => authAdminService.validateAccessToken(c, input.token));
	}

	/**
	 * Refresh admin access token using refresh token (token rotation)
	 */
	async refreshAccessToken(
		ctx: AdminRequestContext,
		input: RefreshAdminAccessTokenInput
	): Promise<RpcResult<RefreshAdminAccessTokenOutput>> {
		return this.rpc(ctx, (c) =>
			authAdminService.refreshAccessToken(c, input.refreshToken, {
				userAgent: input.userAgent,
				ipAddress: input.ipAddress
			})
		);
	}

	/**
	 * Revoke admin session (logout from single device)
	 */
	async revokeSession(
		ctx: AdminRequestContext,
		input: RevokeAdminSessionInput
	): Promise<RpcResult<RevokeAdminSessionOutput>> {
		return this.rpc(ctx, (c) => authAdminService.revokeSession(c, input.refreshToken));
	}

	// =========================================================================
	// Admin-Only Operations (manage other users' sessions)
	// =========================================================================

	/**
	 * Get all active sessions for any user (admin operation)
	 */
	async getAnyUserSessions(
		ctx: AdminRequestContext,
		input: GetAnyUserSessionsInput
	): Promise<RpcResult<GetAnyUserSessionsOutput>> {
		return this.rpc(ctx, (c) => authAdminService.getAnyUserSessions(c, input.userId));
	}

	/**
	 * Revoke a specific session by token ID (admin operation)
	 */
	async revokeAnyUserSession(
		ctx: AdminRequestContext,
		input: RevokeAnyUserSessionInput
	): Promise<RpcResult<RevokeAnyUserSessionOutput>> {
		return this.rpc(ctx, (c) => authAdminService.revokeAnyUserSession(c, input.tokenId));
	}

	/**
	 * Revoke all sessions for any user (admin operation)
	 */
	async revokeAllUserSessions(
		ctx: AdminRequestContext,
		input: RevokeAllUserSessionsInput
	): Promise<RpcResult<RevokeAllUserSessionsOutput>> {
		return this.rpc(ctx, (c) => authAdminService.revokeAllUserSessions(c, input.userId));
	}
}
