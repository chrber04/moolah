import { eq } from "drizzle-orm";

import { users } from "@moolah/database";

import type { RequestContext } from "$lib/context";

/**
 * Fetches a user by their internal ID.
 *
 * @param ctx - Request context with database connection
 * @param id - The user's internal UUID
 *
 * @returns The user record, or undefined if not found
 */
export async function getUser(ctx: RequestContext, id: string) {
	return await ctx.db.query.users.findFirst({
		where: eq(users.id, id)
	});
}

/**
 * Fetches a user by their Discord ID.
 *
 * @param ctx - Request context with database connection
 * @param discordId - The user's Discord snowflake ID
 *
 * @returns The user record, or undefined if not found
 */
export async function getUserByDiscordId(ctx: RequestContext, discordId: string) {
	return await ctx.db.query.users.findFirst({
		where: eq(users.discordId, discordId)
	});
}

export interface CreateUserInput {
	discordId: string;
	displayName: string;
	email?: string;
}

/**
 * Creates a new user.
 *
 * @param ctx - Request context with database connection
 * @param data - User data to insert
 *
 * @returns The newly created user record
 */
export async function createUser(ctx: RequestContext, data: CreateUserInput) {
	const [user] = await ctx.db
		.insert(users)
		.values({
			discordId: data.discordId,
			displayName: data.displayName,
			email: data.email ?? null
		})
		.returning();

	return user;
}
