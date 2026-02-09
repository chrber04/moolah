import * as v from "valibot";

import { UserRole } from "@moolah/domain/user";

/** Current admin user DTO - authenticated admin's own data */
export const currentAdminUserDtoSchema = v.object({
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
	acceptsEssentialCookies: v.boolean(),
	acceptsPerformanceCookies: v.boolean(),
	acceptsFunctionalCookies: v.boolean(),
	acceptsAdvertisingCookies: v.boolean(),
	acceptsAnalyticsCookies: v.boolean(),
	createdAt: v.date(),
	updatedAt: v.date()
});
export type CurrentAdminUserDto = v.InferOutput<typeof currentAdminUserDtoSchema>;
