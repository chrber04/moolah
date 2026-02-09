import * as v from "valibot";

export type StringMessages = {
	/**
	 * Message for when the value is not a string
	 * @default "Value must be a string"
	 */
	notAString?: string;
};

/**
 * Creates a schema for a string.
 * It could be useful if we want to say customize the the error messages for string validation...
 */
export function createStringSchema(messages?: StringMessages) {
	return v.string(messages?.notAString ?? "Value must be a string");
}
export const stringSchema = createStringSchema();
