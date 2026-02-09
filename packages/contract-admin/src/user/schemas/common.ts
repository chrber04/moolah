import * as v from "valibot";

import { UserRole } from "@moolah/domain/user";

/** Minimal user DTO for table rows */
export const adminUserRowDtoSchema = v.object({
	id: v.string(),
	discordId: v.string(),
	role: v.enum(UserRole),
	displayName: v.string(),
	avatarUrl: v.nullable(v.string()),
	email: v.nullable(v.string()),
	createdAt: v.date(),
	deletedAt: v.nullable(v.date())
});
export type AdminUserRowDto = v.InferOutput<typeof adminUserRowDtoSchema>;

/** Full user DTO for detail views */
export const adminUserDetailDtoSchema = v.object({
	id: v.string(),
	discordId: v.string(),
	role: v.enum(UserRole),
	displayName: v.string(),
	avatarUrl: v.nullable(v.string()),
	email: v.nullable(v.string()),
	emailIsVerified: v.boolean(),
	wantsProfilePublic: v.boolean(),
	wantsMarketingEmails: v.boolean(),
	wantsServiceEmails: v.boolean(),
	createdAt: v.date(),
	updatedAt: v.date(),
	deletedAt: v.nullable(v.date()),
	/** Admin-only notes about this user (TODO: add to database schema) */
	adminNotes: v.nullable(v.string())
});
export type AdminUserDetailDto = v.InferOutput<typeof adminUserDetailDtoSchema>;

/** Mutation result DTO */
export const adminMutationResultDtoSchema = v.object({
	success: v.boolean(),
	id: v.string()
});
export type AdminMutationResultDto = v.InferOutput<typeof adminMutationResultDtoSchema>;
