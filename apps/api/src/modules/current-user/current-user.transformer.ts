import type { CurrentAdminUserDto } from "@moolah/contract-admin/current-user";
import type { CurrentUserDto } from "@moolah/contract/current-user";
import type { users } from "@moolah/database";

type DbUser = typeof users.$inferSelect;

export function toCurrentUserDto(user: DbUser): CurrentUserDto {
	return {
		id: user.id,
		discordId: user.discordId,
		role: user.role,
		displayName: user.displayName,
		avatarUrl: user.avatarUrl,
		email: user.email,
		emailIsVerified: user.emailIsVerified,
		wantsProfilePublic: user.wantsProfilePublic,
		wantsMarketingEmails: user.wantsMarketingEmails,
		wantsServiceEmails: user.wantsServiceEmails,
		acceptsEssentialCookies: user.acceptsEssentialCookies,
		acceptsPerformanceCookies: user.acceptsPerformanceCookies,
		acceptsFunctionalCookies: user.acceptsFunctionalCookies,
		acceptsAdvertisingCookies: user.acceptsAdvertisingCookies,
		acceptsAnalyticsCookies: user.acceptsAnalyticsCookies,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	};
}

export function toCurrentAdminUserDto(user: DbUser): CurrentAdminUserDto {
	return {
		id: user.id,
		discordId: user.discordId,
		role: user.role,
		displayName: user.displayName,
		avatarUrl: user.avatarUrl,
		email: user.email,
		emailIsVerified: user.emailIsVerified,
		wantsProfilePublic: user.wantsProfilePublic,
		wantsMarketingEmails: user.wantsMarketingEmails,
		wantsServiceEmails: user.wantsServiceEmails,
		acceptsEssentialCookies: user.acceptsEssentialCookies,
		acceptsPerformanceCookies: user.acceptsPerformanceCookies,
		acceptsFunctionalCookies: user.acceptsFunctionalCookies,
		acceptsAdvertisingCookies: user.acceptsAdvertisingCookies,
		acceptsAnalyticsCookies: user.acceptsAnalyticsCookies,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	};
}
