import * as v from "valibot";

import { UserRole } from "@moolah/domain/user";

import { adminUserRowDtoSchema } from "./common.js";

export const adminGetUsersInputSchema = v.object({
	/** Search by display name or Discord ID */
	search: v.optional(v.string()),
	/** Filter by role */
	role: v.optional(v.enum(UserRole)),
	/** Include soft-deleted (banned) users */
	includeDeleted: v.optional(v.boolean(), false),
	page: v.optional(v.pipe(v.number(), v.minValue(1)), 1),
	limit: v.optional(v.pipe(v.number(), v.minValue(1), v.maxValue(100)), 25)
});
export type AdminGetUsersInput = v.InferOutput<typeof adminGetUsersInputSchema>;

export const adminGetUsersOutputSchema = v.object({
	users: v.array(adminUserRowDtoSchema),
	total: v.number(),
	totalPages: v.number(),
	page: v.number()
});
export type AdminGetUsersOutput = v.InferOutput<typeof adminGetUsersOutputSchema>;
