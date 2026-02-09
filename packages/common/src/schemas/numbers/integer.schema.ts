import * as v from "valibot";

export type IntegerMessages = {
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
};

export function createIntegerSchema(messages?: IntegerMessages) {
	return v.pipe(
		v.number(messages?.notANumber ?? "Value must be a number"),
		v.integer(messages?.notAnInteger ?? "Value must be an integer")
	);
}
export const integerSchema = createIntegerSchema();
