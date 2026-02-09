/**
 * Time duration constants for various application scenarios, represented as strings.
 *
 * @example
 * const duration: TimeDuration = TimeDuration.ONE_HOUR;
 * // console.log(duration) -> "ONE_HOUR"
 */
export const TimeDuration = {
	FIFTEEN_MINUTES: "FIFTEEN_MINUTES",
	THIRTY_MINUTES: "THIRTY_MINUTES",
	ONE_HOUR: "ONE_HOUR",
	THREE_HOURS: "THREE_HOURS",
	SIX_HOURS: "SIX_HOURS",
	TWELVE_HOURS: "TWELVE_HOURS",
	ONE_DAY: "ONE_DAY",
	THREE_DAYS: "THREE_DAYS",
	ONE_WEEK: "ONE_WEEK",
	TWO_WEEKS: "TWO_WEEKS",
	ONE_MONTH: "ONE_MONTH",
	THREE_MONTHS: "THREE_MONTHS",
	SIX_MONTHS: "SIX_MONTHS",
	NINE_MONTHS: "NINE_MONTHS",
	ONE_YEAR: "ONE_YEAR",
	TWO_YEARS: "TWO_YEARS",
	THREE_YEARS: "THREE_YEARS",
	FIVE_YEARS: "FIVE_YEARS"
} as const;

export type TimeDuration = (typeof TimeDuration)[keyof typeof TimeDuration];
