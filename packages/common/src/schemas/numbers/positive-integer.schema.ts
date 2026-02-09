import * as v from "valibot";

export type PositiveIntegerMessages = {
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
	 * Message for when the value is not positive
	 * @default "Value must be greater than 0"
	 */
	notPositive?: string;
};

export function createPositiveIntegerSchema(messages?: PositiveIntegerMessages) {
	return v.pipe(
		v.number(messages?.notANumber ?? "Value must be a number"),
		v.integer(messages?.notAnInteger ?? "Value must be an integer"),
		v.minValue(1, messages?.notPositive ?? "Value must be greater than 0")
	);
}
export const positiveIntegerSchema = createPositiveIntegerSchema();
