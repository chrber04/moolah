import * as v from "valibot";

export type NonNegativeIntegerMessages = {
	/**
	 * Message for when the value is not a number
	 * @default "Value must be a number"
	 */
	notANumber?: string;
	/**
	 * Message for when the value is not an integer
	 * @default "Value must be an integer"
	 */
	notAnInteger?: string;
	/**
	 * Message for when the value is too small
	 * @default "Value must be greater than or equal to 0"
	 */
	tooSmall?: string;
};

export function createNonNegativeIntegerSchema(messages?: NonNegativeIntegerMessages) {
	return v.pipe(
		v.number(messages?.notANumber ?? "Value must be a number"),
		v.integer(messages?.notAnInteger ?? "Value must be an integer"),
		v.minValue(0, messages?.tooSmall ?? "Value must be greater than or equal to 0")
	);
}
export const nonNegativeIntegerSchema = createNonNegativeIntegerSchema();
