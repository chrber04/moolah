import * as v from "valibot";

export type PasswordMessages = {
	/**
	 * Message for when the value is not a string
	 * @default "Value must be a string"
	 */
	notAString?: string;
	/**
	 * Message for when the password is too short
	 * @default "Password must be at least 8 characters"
	 */
	tooShort?: string;
	/**
	 * Message for when the password is too long
	 * @default "Password must not exceed 100 characters"
	 */
	tooLong?: string;
	/**
	 * Message for when the password doesn't meet complexity requirements
	 * @default "Password must contain at least one upper case letter, one lower case letter, and one digit"
	 */
	invalidFormat?: string;
};

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 100;

/**
 * Creates a schema for validating passwords.
 *
 * Verifies that the password is a string, and that its length is
 * between 8 and 100 characters. The password must contain at least
 * one upper case letter, one lower case letter, and one digit.
 */
export function createPasswordSchema(messages?: PasswordMessages) {
	return v.pipe(
		v.string(messages?.notAString ?? "Value must be a string"),
		v.minLength(8, messages?.tooShort ?? "Password must be at least 8 characters"),
		v.maxLength(100, messages?.tooLong ?? "Password must not exceed 100 characters"),
		v.regex(
			/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
			messages?.invalidFormat ??
				"Password must contain at least one upper case letter, one lower case letter, and one digit"
		)
	);
}
export const passwordSchema = createPasswordSchema();
