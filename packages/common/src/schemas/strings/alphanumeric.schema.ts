import * as v from "valibot";

export type AlphanumericMessages = {
	/**
	 * Message for when the value is not a string
	 * @default "Value must be a string"
	 */
	notAString?: string;
	/**
	 * Message for when the value contains non-alphanumeric characters
	 * @default "Only letters and numbers are allowed"
	 */
	invalidCharacters?: string;
};

export const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;

/**
 * Creates a schema for validating alphanumeric strings.
 * Allows only letters (a-z, A-Z) and numbers (0-9).
 *
 * @example
 * const schema = createAlphanumericSchema();
 * v.parse(schema, "Hello123"); // ✅ Valid
 * v.parse(schema, "Hello-123"); // ❌ Invalid (contains hyphen)
 */
export function createAlphanumericSchema(messages?: AlphanumericMessages) {
	return v.pipe(
		v.string(messages?.notAString ?? "Value must be a string"),
		v.regex(
			ALPHANUMERIC_REGEX,
			messages?.invalidCharacters ?? "Only letters and numbers are allowed"
		)
	);
}
export const alphanumericSchema = createAlphanumericSchema();
