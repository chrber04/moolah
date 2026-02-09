import * as v from "valibot";

export type UuidMessages = {
	/**
	 * Message for when the value is not a string
	 * @default "Value must be a string"
	 */
	notAString?: string;
	/**
	 * Message for when the value is not a valid UUID
	 * @default "Invalid UUID format"
	 */
	invalidFormat?: string;
};

/**
 * Creates a schema for a UUID.
 *
 * This schema verifies that the provided UUID is a string and matches the UUID format.
 */
export function createUuidSchema(messages?: UuidMessages) {
	return v.pipe(
		v.string(messages?.notAString ?? "Value must be a string"),
		v.uuid(messages?.invalidFormat ?? "Invalid UUID format")
	);
}
export const uuidSchema = createUuidSchema();
