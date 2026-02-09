/**
 * SEO and metadata configuration.
 *
 * Contains Open Graph, Twitter cards, keywords, and other SEO-specific settings.
 * For core project info, use `projectConfig` instead.
 *
 * @example
 * import { seoConfig } from "@moolah/core/configs";
 *
 * <title>{seoConfig.title}</title>
 * <meta property="og:image" content={seoConfig.openGraph.images} />
 */
export const seoConfig = {
	title: "Moolah - Earn Money Completing Tasks",
	template: "%s | Moolah",
	description:
		"Online platform for micro jobs and tasks. Earn money completing surveys, data entry, app testing, and small gigs. Join thousands of workers making money online in 2026.",
	thumbnail: "/images/og-default.png",
	keywords: [
		"micro jobs",
		"microtasks",
		"earn money online",
		"freelance gigs",
		"small tasks",
		"online jobs",
		"work from home",
		"gig economy",
		"complete surveys",
		"data entry jobs",
		"app testing",
		"make money online",
		"side hustle",
		"remote work",
		"freelance platform"
	],
	authors: [{ name: "Moolah" }],
	creator: "Moolah",
	openGraph: {
		type: "website",
		url: "https://moolah.com",
		siteName: "Moolah",
		title: "Moolah - Earn Money Completing Tasks",
		description: "Join our platform and earn money completing micro jobs, surveys, and simple online tasks.",
		images: "/images/og-default.png",
		locale: "en_US"
	},
	twitter: {
		card: "summary_large_image",
		site: "@moolah",
		creator: "@moolah",
		title: "Moolah - Earn Money Completing Tasks",
		description: "Join our platform and earn money completing micro jobs, surveys, and simple online tasks.",
		images: "/images/og-default.png"
	}
} as const;

export type SeoConfig = typeof seoConfig;
