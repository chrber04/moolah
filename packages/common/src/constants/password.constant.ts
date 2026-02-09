/**
 * @rule Regular expression for validating that a password contains at least one uppercase letter, one lowercase letter, and one digit.
 */
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/;
/**
 * @rule Minimum length for a valid password.
 */
export const PASSWORD_MIN_LENGTH = 8;
/**
 * @rule Maximum length for a valid password.
 */
export const PASSWORD_MAX_LENGTH = 100;
