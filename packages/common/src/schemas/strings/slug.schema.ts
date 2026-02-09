import * as v from "valibot";

export type SlugMessages = {
	/**
	 * Message for when the value is not a string
	 * @default "Value must be a string"
	 */
	notAString?: string;
	/**
	 * Message for when the slug is too short
	 * @default "Slug should have at least 1 character"
	 */
	tooShort?: string;
	/**
	 * Message for when the slug is too long
	 * @default "Slug should not exceed 50 characters"
	 */
	tooLong?: string;
	/**
	 * Message for when the slug has invalid format
	 * @default "Slug should only contain lowercase alphanumeric characters and hyphens"
	 */
	invalidFormat?: string;
};

/**
 * Creates a slug schema.
 * A URL-friendly identifier with lowercase letters, numbers, and hyphens.
 *
 * @example "my-awesome-blog-post"
 */
export function createSlugSchema(messages?: SlugMessages) {
	return v.pipe(
		v.string(messages?.notAString ?? "Value must be a string"),
		v.minLength(1, messages?.tooShort ?? "Slug should have at least 1 character"),
		v.maxLength(50, messages?.tooLong ?? "Slug should not exceed 50 characters"),
		v.regex(
			/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
			messages?.invalidFormat ??
				"Slug should only contain lowercase alphanumeric characters and hyphens"
		)
	);
}
export const slugSchema = createSlugSchema();
