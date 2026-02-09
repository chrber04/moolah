import * as v from "valibot";

export type NonNegativeNumberMessages = {
	/**
	 * Message for when the value is not a number
	 * @default "Value must be a number"
	 */
	notANumber?: string;
	/**
	 * Message for when the value is too small
	 * @default "Value must be greater than or equal to 0"
	 */
	tooSmall?: string;
};

export function createNonNegativeNumberSchema(messages?: NonNegativeNumberMessages) {
	return v.pipe(
		v.number(messages?.notANumber ?? "Value must be a number"),
		v.minValue(0, messages?.tooSmall ?? "Value must be greater than or equal to 0")
	);
}
export const nonNegativeNumberSchema = createNonNegativeNumberSchema();
