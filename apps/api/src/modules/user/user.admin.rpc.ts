
import type { Env } from "$env";
import { RpcTarget } from "cloudflare:workers";

import type {
	AdminBanUserInput,
	AdminGetUserInput,
	AdminGetUserOutput,
	AdminGetUsersInput,
	AdminGetUsersOutput,
	AdminMutationResultDto,
	AdminUnbanUserInput,
	AdminUpdateUserRoleInput
} from "@moolah/contract-admin/user";
import type { AdminRequestContext } from "@moolah/contract-admin/context";
import type { RpcResult } from "@moolah/core/rpc";

import { createRpcHandler } from "$lib/rpc";

import * as userAdminService from "./user.admin.service";

export class UsersAdminRpcTarget extends RpcTarget {
	private rpc: ReturnType<typeof createRpcHandler>;

	constructor(env: Env) {
		super();
		this.rpc = createRpcHandler(env);
	}

	async getUser(
		ctx: AdminRequestContext,
		input: AdminGetUserInput
	): Promise<RpcResult<AdminGetUserOutput>> {
		return this.rpc(ctx, (c) => userAdminService.getUser(c, input));
	}

	async getUsers(
		ctx: AdminRequestContext,
		input: AdminGetUsersInput
	): Promise<RpcResult<AdminGetUsersOutput>> {
		return this.rpc(ctx, (c) => userAdminService.getUsers(c, input));
	}

	async updateUserRole(
		ctx: AdminRequestContext,
		input: AdminUpdateUserRoleInput
	): Promise<RpcResult<AdminMutationResultDto>> {
		return this.rpc(ctx, (c) => userAdminService.updateUserRole(c, input));
	}

	async banUser(
		ctx: AdminRequestContext,
		input: AdminBanUserInput
	): Promise<RpcResult<AdminMutationResultDto>> {
		return this.rpc(ctx, (c) => userAdminService.banUser(c, input));
	}

	async unbanUser(
		ctx: AdminRequestContext,
		input: AdminUnbanUserInput
	): Promise<RpcResult<AdminMutationResultDto>> {
		return this.rpc(ctx, (c) => userAdminService.unbanUser(c, input));
	}
}
