import * as v from "valibot";

import { TimeDuration } from "../../enums/time-duration.enum";

export type TimeDurationMessages = {
	/**
	 * Message for when the value is not a valid time duration
	 * @default "Invalid time duration"
	 */
	invalidDuration?: string;
};

/**
 * Creates a schema for validating time durations.
 *
 * @example
 * const schema = createTimeDurationSchema();
 * const result = v.parse(schema, TimeDuration.DAYS_7); // ✅ Valid
 *
 * @example With custom message
 * const schema = createTimeDurationSchema({
 *   invalidDuration: "Please select a valid time period"
 * });
 */
export function createTimeDurationSchema(messages?: TimeDurationMessages) {
	return v.enum(TimeDuration, messages?.invalidDuration ?? "Invalid time duration");
}
export const timeDurationSchema = createTimeDurationSchema();
