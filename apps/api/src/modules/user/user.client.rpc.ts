
import type { Env } from "$env";
import { RpcTarget } from "cloudflare:workers";

import type { ClientRequestContext } from "@moolah/contract/context";
import type { RpcResult } from "@moolah/core/rpc";

import { createRpcHandler } from "$lib/rpc";

import type { CreateUserInput } from "./user.client.service";
import * as usersService from "./user.client.service";

export class UsersRpcTarget extends RpcTarget {
	private rpc: ReturnType<typeof createRpcHandler>;

	constructor(env: Env) {
		super();
		this.rpc = createRpcHandler(env);
	}

	async getUser(ctx: ClientRequestContext, id: string): Promise<RpcResult<unknown>> {
		return this.rpc(ctx, (c) => usersService.getUser(c, id));
	}

	async getUserByDiscordId(
		ctx: ClientRequestContext,
		discordId: string
	): Promise<RpcResult<unknown>> {
		return this.rpc(ctx, (c) => usersService.getUserByDiscordId(c, discordId));
	}

	async createUser(ctx: ClientRequestContext, data: CreateUserInput): Promise<RpcResult<unknown>> {
		return this.rpc(ctx, (c) => usersService.createUser(c, data));
	}
}
