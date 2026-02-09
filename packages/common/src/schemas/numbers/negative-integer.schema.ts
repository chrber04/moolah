import * as v from "valibot";

export type NegativeIntegerMessages = {
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
	 * Message for when the value is not negative
	 * @default "Value must be a negative integer"
	 */
	notNegative?: string;
};

export function createNegativeIntegerSchema(messages?: NegativeIntegerMessages) {
	return v.pipe(
		v.number(messages?.notANumber ?? "Value must be a number"),
		v.integer(messages?.notAnInteger ?? "Value must be an integer"),
		v.maxValue(-1, messages?.notNegative ?? "Value must be a negative integer")
	);
}
export const negativeIntegerSchema = createNegativeIntegerSchema();
