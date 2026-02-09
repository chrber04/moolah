/**
 * Formats a member count to a human-readable string.
 * @example formatMemberCount(1234) // "1,234"
 * @example formatMemberCount(12345) // "12.3K"
 * @example formatMemberCount(1234567) // "1.2M"
 */
export const formatMemberCount = (count: number): string => {
	if (count < 10000) {
		return count.toLocaleString("en-US");
	} else if (count < 1000000) {
		return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
	} else {
		return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
	}
};

/**
 * Formats an online count with the online indicator.
 * @example formatOnlineCount(1234) // "1,234 online"
 */
export const formatOnlineCount = (count: number): string => {
	return `${formatMemberCount(count)} online`;
};

/**
 * Formats a growth percentage.
 * @example formatGrowth(15.2) // "+15.2%"
 * @example formatGrowth(-5.3) // "-5.3%"
 */
export const formatGrowth = (percent: number): string => {
	const sign = percent >= 0 ? "+" : "";
	return `${sign}${percent.toFixed(1)}%`;
};

/**
 * Formats a timestamp to a relative time string.
 * @example formatRelativeTime(new Date()) // "just now"
 * @example formatRelativeTime(hourAgo) // "1 hour ago"
 */
export const formatRelativeTime = (date: Date): string => {
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const seconds = Math.floor(diff / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const weeks = Math.floor(days / 7);
	const months = Math.floor(days / 30);
	const years = Math.floor(days / 365);

	if (seconds < 60) return "just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
	if (weeks < 4) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
	if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
	return `${years} year${years === 1 ? "" : "s"} ago`;
};

/**
 * Formats a date to a locale string.
 */
export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		...options
	});
};

/**
 * Truncates text to a maximum length with ellipsis.
 */
export const truncateText = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - 3) + "...";
};
