/**
 * Server-related limits and constraints.
 *
 * @example
 * if (description.length > ServerLimits.MAX_DESCRIPTION_LENGTH) {
 *   throw new Error("Description too long");
 * }
 */
export const ServerLimits = {
	/** Minimum member count to be listed */
	MIN_MEMBERS: 10,

	/** Maximum description length */
	MAX_DESCRIPTION_LENGTH: 500,

	/** Maximum tags per server */
	MAX_TAGS: 5,

	/** Bump cooldown in milliseconds (6 hours) */
	BUMP_COOLDOWN_MS: 6 * 60 * 60 * 1000
} as const;
