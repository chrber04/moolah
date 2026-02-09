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
	title: "Moolah - Monetize Your Audience with Rewarded Offers & Surveys",
	template: "%s | Moolah",
	description:
		"Offerwall platform for publishers and advertisers. Monetize your audience with offers, surveys, and games. Easy iframe integration with real-time callbacks and detailed analytics.",
	thumbnail: "/images/og-default.png",
	keywords: [
		"offerwall",
		"offer wall",
		"offerwall platform",
		"survey monetization",
		"publisher monetization",
		"offerwall integration",
		"iframe offerwall",
		"reward platform",
		"offer wall API",
		"survey API",
		"app monetization",
		"user engagement",
		"offerwall provider",
		"callback integration",
		"postback system"
	],
	authors: [{ name: "Moolah" }],
	creator: "Moolah",
	openGraph: {
		type: "website",
		url: "https://moolah.com",
		siteName: "Moolah",
		title: "Moolah - Monetize Your Audience with Rewarded Offers & Surveys",
		description: "Monetize your audience with offers, surveys, and games. Easy iframe integration with real-time callbacks.",
		images: "/images/og-default.png",
		locale: "en_US"
	},
	twitter: {
		card: "summary_large_image",
		site: "@moolah",
		creator: "@moolah",
		title: "Moolah - Monetize Your Audience with Rewarded Offers & Surveys",
		description: "Monetize your audience with offers, surveys, and games. Easy iframe integration with real-time callbacks.",
		images: "/images/og-default.png"
	}
} as const;

export type SeoConfig = typeof seoConfig;
