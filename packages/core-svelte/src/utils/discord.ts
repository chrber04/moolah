/**
 * Discord-specific utility functions
 */

const DISCORD_CDN = "https://cdn.discordapp.com";

/**
 * Gets the Discord avatar URL for a user.
 */
export const getAvatarUrl = (
	userId: string,
	avatarHash: string | null,
	size: 16 | 32 | 64 | 128 | 256 | 512 | 1024 = 128
): string => {
	if (!avatarHash) {
		// Default avatar based on discriminator or user ID
		const defaultIndex = Number(BigInt(userId) >> BigInt(22)) % 6;
		return `${DISCORD_CDN}/embed/avatars/${defaultIndex}.png`;
	}

	const extension = avatarHash.startsWith("a_") ? "gif" : "webp";
	return `${DISCORD_CDN}/avatars/${userId}/${avatarHash}.${extension}?size=${size}`;
};

/**
 * Gets the Discord server icon URL.
 */
export const getServerIconUrl = (
	serverId: string,
	iconHash: string | null,
	size: 16 | 32 | 64 | 128 | 256 | 512 | 1024 = 128
): string | null => {
	if (!iconHash) return null;

	const extension = iconHash.startsWith("a_") ? "gif" : "webp";
	return `${DISCORD_CDN}/icons/${serverId}/${iconHash}.${extension}?size=${size}`;
};

/**
 * Gets the Discord server banner URL.
 */
export const getServerBannerUrl = (
	serverId: string,
	bannerHash: string | null,
	size: 480 | 600 | 1024 | 2048 = 600
): string | null => {
	if (!bannerHash) return null;

	const extension = bannerHash.startsWith("a_") ? "gif" : "webp";
	return `${DISCORD_CDN}/banners/${serverId}/${bannerHash}.${extension}?size=${size}`;
};

/**
 * Gets the Discord server splash URL.
 */
export const getServerSplashUrl = (
	serverId: string,
	splashHash: string | null,
	size: 480 | 600 | 1024 | 2048 = 600
): string | null => {
	if (!splashHash) return null;

	return `${DISCORD_CDN}/splashes/${serverId}/${splashHash}.webp?size=${size}`;
};

/**
 * Generates a Discord invite URL.
 */
export const getInviteUrl = (inviteCode: string): string => {
	return `https://discord.gg/${inviteCode}`;
};

/**
 * Parses a Discord invite URL to extract the invite code.
 */
export const parseInviteUrl = (url: string): string | null => {
	const patterns = [
		/discord\.gg\/([a-zA-Z0-9]+)/,
		/discord\.com\/invite\/([a-zA-Z0-9]+)/,
		/discordapp\.com\/invite\/([a-zA-Z0-9]+)/
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match?.[1]) return match[1];
	}

	return null;
};

/**
 * Validates a Discord invite code format.
 */
export const isValidInviteCode = (code: string): boolean => {
	return /^[a-zA-Z0-9]{2,32}$/.test(code);
};
