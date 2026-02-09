import { eq } from "drizzle-orm";

import type {
	GetCurrentAdminUserInput,
	GetCurrentAdminUserOutput
} from "@moolah/contract-admin/current-user";
import { users } from "@moolah/database";

import type { RequestContext } from "$lib/context";
import { NotFoundException } from "$exceptions/http.exception";

import { toCurrentAdminUserDto } from "./current-user.transformer";

// -------------------------------------
// Service Functions
// -------------------------------------

/**
 * Fetches the current authenticated admin user's data.
 * Used for populating admin panel UI state.
 */
export async function getCurrentAdminUser(
	ctx: RequestContext,
	input: GetCurrentAdminUserInput
): Promise<GetCurrentAdminUserOutput> {
	const { userId } = input;

	const user = await ctx.db.query.users.findFirst({
		where: eq(users.id, userId)
	});

	if (!user) {
		throw new NotFoundException();
	}

	return toCurrentAdminUserDto(user);
}
