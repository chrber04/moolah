/**
 * Review-related limits and constraints.
 *
 * @example
 * if (rating < ReviewLimits.MIN_RATING || rating > ReviewLimits.MAX_RATING) {
 *   throw new Error("Invalid rating");
 * }
 */
export const ReviewLimits = {
	/** Minimum rating value */
	MIN_RATING: 1,

	/** Maximum rating value */
	MAX_RATING: 5,

	/** Maximum review content length */
	MAX_CONTENT_LENGTH: 1000
} as const;
