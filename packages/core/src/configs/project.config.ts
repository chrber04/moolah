/**
 * Core project configuration.
 *
 * Contains essential project identity, URLs, social links, and contact info.
 * For SEO-specific configuration, use `seoConfig` instead.
 *
 * @example
 * import { projectConfig } from "@moolah/core/configs";
 *
 * console.log(projectConfig.name); // "Moolah"
 * console.log(projectConfig.links.discord); // "https://discord.gg/moolah"
 */
export const projectConfig = {
	name: "Moolah",
	slug: "moolah",
	tagline: "Earn Money Completing Tasks",
	url: "https://moolah.com",
	description:
		"Online platform connecting workers with micro jobs and tasks. Earn money completing surveys, data entry, app testing, and more. Employers post tasks and hire from our global workforce.",
	logo: "/images/logo.svg",
	copyright: "Moolah",
	foundedYear: 2024,
	links: {
		discord: "https://discord.gg/moolah",
		twitter: "https://twitter.com/moolah",
		github: "https://github.com/moolah",
		youtube: "https://youtube.com/@moolah"
	},
	contact: {
		support: "support@moolah.com",
		business: "business@moolah.com",
		legal: "legal@moolah.com",
		security: "security@moolah.com"
	},
	legal: {
		terms: "/legal/terms",
		privacy: "/legal/privacy",
		cookies: "/legal/cookies",
		dmca: "/legal/dmca",
		guidelines: "/legal/guidelines"
	}
} as const;

export type ProjectConfig = typeof projectConfig;
