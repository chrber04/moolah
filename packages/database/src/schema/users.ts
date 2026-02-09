import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { UserRole } from "@moolah/domain/user";

import { primaryId } from "../utils";

export const users = sqliteTable(
	"users",
	{
		id: primaryId,
		discordId: text("discord_id").notNull().unique(),

		role: text("role").$type<UserRole>().notNull().default("REGULAR"),

		displayName: text("display_name").notNull(),
		avatarUrl: text("avatar_url"),

		email: text("email").unique(),
		emailIsVerified: integer("email_is_verified", { mode: "boolean" }).notNull().default(false),

		// Cached Discord guilds (fetched during OAuth, user can manage)
		// JSON array of { id, name, icon, owner, permissions }
		discordGuilds: text("discord_guilds"),
		discordGuildsUpdatedAt: integer("discord_guilds_updated_at", { mode: "timestamp" }),

		// User Preferences
		wantsProfilePublic: integer("wants_profile_public", { mode: "boolean" })
			.notNull()
			.default(false),
		wantsMarketingEmails: integer("wants_marketing_emails", { mode: "boolean" })
			.notNull()
			.default(false),
		wantsServiceEmails: integer("wants_service_emails", { mode: "boolean" })
			.notNull()
			.default(true),

		// Cookie Consents (GDPR)
		acceptsEssentialCookies: integer("accepts_essential_cookies", { mode: "boolean" })
			.notNull()
			.default(true),
		acceptsPerformanceCookies: integer("accepts_performance_cookies", { mode: "boolean" })
			.notNull()
			.default(false),
		acceptsFunctionalCookies: integer("accepts_functional_cookies", { mode: "boolean" })
			.notNull()
			.default(false),
		acceptsAdvertisingCookies: integer("accepts_advertising_cookies", { mode: "boolean" })
			.notNull()
			.default(false),
		acceptsAnalyticsCookies: integer("accepts_analytics_cookies", { mode: "boolean" })
			.notNull()
			.default(false),

		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(unixepoch())`),
		deletedAt: integer("deleted_at", { mode: "timestamp" })
	},
	(table) => [
		index("users_discord_id_idx").on(table.discordId),
		index("users_role_idx").on(table.role),
		index("users_email_idx").on(table.email),
		index("users_wants_marketing_emails_idx").on(table.wantsMarketingEmails),
		index("users_created_at_idx").on(table.createdAt),
		index("users_deleted_at_idx").on(table.deletedAt)
	]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
