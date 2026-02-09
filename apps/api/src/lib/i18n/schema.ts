/**
 * Message Schema - Source of truth for all i18n message keys.
 *
 * Key format: {namespace}_{category}_{specificKey}
 * - Underscore (_) separates namespace/category
 * - camelCase for multi-word keys
 *
 * TypeScript ensures:
 * 1. All message keys are valid (autocomplete + typo detection)
 * 2. All locales implement every message
 */
export interface Messages {
	global_fallback: string;
	global_exception_fallback: string;
	global_exception_badRequest: string;
	global_exception_unauthorized: string;
	global_exception_forbidden: string;
	global_exception_notFound: string;
	global_exception_conflict: string;
	global_exception_tooManyRequests: string;
	global_exception_internalServerError: string;
	global_exception_serviceUnavailable: string;
}

/**
 * All valid message keys.
 * @example "global_exception_notFound"
 */
export type MessageKey = keyof Messages;
