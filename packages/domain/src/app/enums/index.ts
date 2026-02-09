/**
 * Moolah application/service identifiers.
 *
 * These represent the four Cloudflare-hosted services that make up Moolah:
 * - API: Main backend API (Cloudflare Workers)
 * - WEB_ADMIN: Admin dashboard (Cloudflare Pages)
 * - WEB_PUBLIC: Public-facing website (Cloudflare Pages)
 * - BOT: Discord bot backend (Cloudflare Workers)
 */
export const AppService = {
	/** Main backend API (Cloudflare Workers) */
	API: "api",
	/** Admin dashboard (Cloudflare Pages) */
	WEB_ADMIN: "webAdmin",
	/** Public-facing website (Cloudflare Pages) */
	WEB_PUBLIC: "webPublic",
	/** Discord bot backend (Cloudflare Workers) */
	BOT: "bot"
} as const;

export type AppService = (typeof AppService)[keyof typeof AppService];

/** Human-readable labels for each service */
export const AppServiceLabel: Record<AppService, string> = {
	[AppService.API]: "API",
	[AppService.WEB_ADMIN]: "Web Admin",
	[AppService.WEB_PUBLIC]: "Web Public",
	[AppService.BOT]: "Bot"
} as const;
