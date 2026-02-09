/**
 * Supported locales across the application.
 * Used for i18n, blog translations, UI language selection, etc.
 *
 * @example
 * const locale: Locale = Locale.EN;
 * // console.log(locale) -> "en"
 */
export const Locale = {
	/** English */
	EN: "en",
	/** Spanish */
	ES: "es"
} as const;

export type Locale = (typeof Locale)[keyof typeof Locale];

/**
 * Array of all supported locales.
 * Useful for iteration, validation, and type guards.
 */
export const LOCALES = Object.values(Locale) as Locale[];

/**
 * Default locale for the application.
 */
export const DEFAULT_LOCALE: Locale = Locale.EN;
