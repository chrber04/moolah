import * as v from "valibot";

export type TwoFactorAuthCodeMessages = {
	/**
	 * Message for when the value is not a string
	 * @default "Value must be a string"
	 */
	notAString?: string;
	/**
	 * Message for when the code is not exactly 6 characters
	 * @default "Two-factor authentication code must be exactly 6 characters"
	 */
	invalidLength?: string;
};

/**
 * Creates a schema for twoFactorAuthCode.
 *
 * Verifies that the twoFactorAuthCode is a string,
 * and that its length is exactly 6 characters.
 */
export function createTwoFactorAuthCodeSchema(messages?: TwoFactorAuthCodeMessages) {
	return v.pipe(
		v.string(messages?.notAString ?? "Value must be a string"),
		v.length(
			6,
			messages?.invalidLength ?? "Two-factor authentication code must be exactly 6 characters"
		)
	);
}
export const twoFactorAuthCodeSchema = createTwoFactorAuthCodeSchema();
