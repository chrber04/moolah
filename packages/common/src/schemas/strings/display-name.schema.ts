import * as v from "valibot";

import {
	DISPLAY_NAME_MAX_LENGTH,
	DISPLAY_NAME_MIN_LENGTH
} from "../../constants/display-name.constant.js";

export type DisplayNameMessages = {
	/**
	 * Message for when the value is not a string
	 * @default "Value must be a string"
	 */
	notAString?: string;
	/**
	 * Message for when the value is too short
	 * @default "Display name must be at least {min} characters"
	 */
	tooShort?: string;
	/**
	 * Message for when the value is too long
	 * @default "Display name must not exceed {max} characters"
	 */
	tooLong?: string;
};

export function createDisplayNameSchema(messages?: DisplayNameMessages) {
	return v.pipe(
		v.string(messages?.notAString ?? "Value must be a string"),
		v.minLength(
			DISPLAY_NAME_MIN_LENGTH,
			messages?.tooShort ?? `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters`
		),
		v.maxLength(
			DISPLAY_NAME_MAX_LENGTH,
			messages?.tooLong ?? `Display name must not exceed ${DISPLAY_NAME_MAX_LENGTH} characters`
		)
	);
}
export const displayNameSchema = createDisplayNameSchema();
