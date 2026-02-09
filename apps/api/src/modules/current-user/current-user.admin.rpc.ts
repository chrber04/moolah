import type { Env } from "$env";
import { RpcTarget } from "cloudflare:workers";

import type { AdminRequestContext } from "@moolah/contract-admin/context";
import type {
	GetCurrentAdminUserInput,
	GetCurrentAdminUserOutput
} from "@moolah/contract-admin/current-user";
import type { RpcResult } from "@moolah/core/rpc";

import { createRpcHandler } from "$lib/rpc";

import * as currentUserAdminService from "./current-user.admin.service";

export class CurrentUserAdminRpcTarget extends RpcTarget {
	private rpc: ReturnType<typeof createRpcHandler>;

	constructor(env: Env) {
		super();
		this.rpc = createRpcHandler(env);
	}

	async getCurrentAdminUser(
		ctx: AdminRequestContext,
		input: GetCurrentAdminUserInput
	): Promise<RpcResult<GetCurrentAdminUserOutput>> {
		return this.rpc(ctx, (c) => currentUserAdminService.getCurrentAdminUser(c, input));
	}
}
