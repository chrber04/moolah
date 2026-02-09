import type { Env } from "$env";
import { RpcTarget } from "cloudflare:workers";

import type { ClientRequestContext } from "@moolah/contract/context";
import type {
	GetCurrentUserInput,
	GetCurrentUserOutput,
	UpdateCurrentUserDisplayNameInput,
	UpdateCurrentUserDisplayNameOutput
} from "@moolah/contract/current-user";
import type { RpcResult } from "@moolah/core/rpc";

import { createRpcHandler } from "$lib/rpc";

import * as currentUserClientService from "./current-user.client.service";

export class CurrentUserClientRpcTarget extends RpcTarget {
	private rpc: ReturnType<typeof createRpcHandler>;

	constructor(env: Env) {
		super();
		this.rpc = createRpcHandler(env);
	}

	async getCurrentUser(
		ctx: ClientRequestContext,
		input: GetCurrentUserInput
	): Promise<RpcResult<GetCurrentUserOutput>> {
		return this.rpc(ctx, (c) => currentUserClientService.getCurrentUser(c, input));
	}

	async updateDisplayName(
		ctx: ClientRequestContext,
		input: UpdateCurrentUserDisplayNameInput
	): Promise<RpcResult<UpdateCurrentUserDisplayNameOutput>> {
		return this.rpc(ctx, (c) => currentUserClientService.updateCurrentUserDisplayName(c, input));
	}
}
