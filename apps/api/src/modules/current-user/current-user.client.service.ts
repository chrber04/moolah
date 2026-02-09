import { eq } from "drizzle-orm";

import type {
	GetCurrentUserInput,
	GetCurrentUserOutput,
	UpdateCurrentUserDisplayNameInput,
	UpdateCurrentUserDisplayNameOutput
} from "@moolah/contract/current-user";
import { users } from "@moolah/database";

import type { RequestContext } from "$lib/context";
import { NotFoundException } from "$exceptions/http.exception";

import { toCurrentUserDto } from "./current-user.transformer";

// -------------------------------------
// Service Functions
// -------------------------------------

/**
 * Fetches the current authenticated user's data.
 * Used for populating UI state after login.
 */
export async function getCurrentUser(
	ctx: RequestContext,
	input: GetCurrentUserInput
): Promise<GetCurrentUserOutput> {
	const { userId } = input;

	const user = await ctx.db.query.users.findFirst({
		where: eq(users.id, userId)
	});

	if (!user) {
		throw new NotFoundException();
	}

	return toCurrentUserDto(user);
}

/**
 * Updates the current user's display name.
 */
export async function updateCurrentUserDisplayName(
	ctx: RequestContext,
	input: UpdateCurrentUserDisplayNameInput
): Promise<UpdateCurrentUserDisplayNameOutput> {
	const { userId, displayName } = input;

	const user = await ctx.db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: { id: true }
	});

	if (!user) {
		throw new NotFoundException();
	}

	await ctx.db
		.update(users)
		.set({ displayName, updatedAt: new Date() })
		.where(eq(users.id, userId));

	return displayName;
}
