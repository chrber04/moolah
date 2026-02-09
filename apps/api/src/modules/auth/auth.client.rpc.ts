import type { Env } from "$env";
import { RpcTarget } from "cloudflare:workers";

import type {
	GetUserSessionsInput,
	GetUserSessionsOutput,
	HandleDiscordCallbackInput,
	HandleDiscordCallbackOutput,
	InitiateDiscordOAuthOutput,
	RefreshAccessTokenInput,
	RefreshAccessTokenOutput,
	RevokeAllSessionsInput,
	RevokeAllSessionsOutput,
	RevokeSessionInput,
	RevokeSessionOutput,
	ValidateAccessTokenInput,
	ValidateAccessTokenOutput
} from "@moolah/contract/auth";
import type { ClientRequestContext } from "@moolah/contract/context";
import type { RpcResult } from "@moolah/core/rpc";

import { createRpcHandler } from "$lib/rpc";

import * as authClientService from "./auth.client.service";

export class AuthClientRpcTarget extends RpcTarget {
	private rpc: ReturnType<typeof createRpcHandler>;

	constructor(env: Env) {
		super();
		this.rpc = createRpcHandler(env);
	}

	/**
	 * Initiate Discord OAuth flow
	 * Generates authorization URL with PKCE parameters
	 */
	async initiateDiscordOAuth(
		ctx: ClientRequestContext
	): Promise<RpcResult<InitiateDiscordOAuthOutput>> {
		return this.rpc(ctx, (c) => authClientService.initiateDiscordOAuth(c));
	}

	/**
	 * Handle Discord OAuth callback
	 * Exchange code for tokens and create/update user
	 */
	async handleDiscordCallback(
		ctx: ClientRequestContext,
		input: HandleDiscordCallbackInput
	): Promise<RpcResult<HandleDiscordCallbackOutput>> {
		return this.rpc(ctx, (c) =>
			authClientService.handleDiscordCallback(c, input.code, input.codeVerifier, {
				userAgent: input.userAgent,
				ipAddress: input.ipAddress
			})
		);
	}

	/**
	 * Validate an access token
	 */
	async validateAccessToken(
		ctx: ClientRequestContext,
		input: ValidateAccessTokenInput
	): Promise<RpcResult<ValidateAccessTokenOutput>> {
		return this.rpc(ctx, (c) => authClientService.validateAccessToken(c, input.token));
	}

	/**
	 * Refresh access token using refresh token (token rotation)
	 */
	async refreshAccessToken(
		ctx: ClientRequestContext,
		input: RefreshAccessTokenInput
	): Promise<RpcResult<RefreshAccessTokenOutput>> {
		return this.rpc(ctx, (c) =>
			authClientService.refreshAccessToken(c, input.refreshToken, {
				userAgent: input.userAgent,
				ipAddress: input.ipAddress
			})
		);
	}

	/**
	 * Revoke a session (logout from single device)
	 */
	async revokeSession(
		ctx: ClientRequestContext,
		input: RevokeSessionInput
	): Promise<RpcResult<RevokeSessionOutput>> {
		return this.rpc(ctx, (c) => authClientService.revokeSession(c, input.refreshToken));
	}

	/**
	 * Revoke all sessions for a user (logout from all devices)
	 */
	async revokeAllSessions(
		ctx: ClientRequestContext,
		input: RevokeAllSessionsInput
	): Promise<RpcResult<RevokeAllSessionsOutput>> {
		return this.rpc(ctx, (c) => authClientService.revokeAllSessions(c, input.userId));
	}

	/**
	 * Get all active sessions for a user (for "Active Devices" UI)
	 */
	async getUserSessions(
		ctx: ClientRequestContext,
		input: GetUserSessionsInput
	): Promise<RpcResult<GetUserSessionsOutput>> {
		return this.rpc(ctx, (c) => authClientService.getUserSessions(c, input.userId));
	}
}
