import * as v from "valibot";

export type EmailMessages = {
	/**
	 * Message for when the value is not a string
	 * @default "Value must be a string"
	 */
	notAString?: string;
	/**
	 * Message for when the value is not a valid email
	 * @default "Invalid email address"
	 */
	invalidFormat?: string;
};

export function createEmailSchema(messages?: EmailMessages) {
	return v.pipe(
		v.string(messages?.notAString ?? "Value must be a string"),
		v.email(messages?.invalidFormat ?? "Invalid email address")
	);
}
export const emailSchema = createEmailSchema();
