import type { Messages } from "$lib/i18n/schema";

/**
 * English locale messages.
 */
export const en: Messages = {
	global_fallback: "Operation successful.",
	global_exception_fallback: "An unexpected error occurred. Please try again later.",
	global_exception_badRequest: "Something's missing or incorrect. Please check and try again.",
	global_exception_unauthorized: "You need to sign in to access this.",
	global_exception_forbidden: "You don't have permission to do this.",
	global_exception_notFound: "We couldn't find what you were looking for.",
	global_exception_conflict: "There's a conflict with something. Please try again.",
	global_exception_tooManyRequests: "Too many requests. Please try again later.",
	global_exception_internalServerError: "Something went wrong on our end. We're looking into it.",
	global_exception_serviceUnavailable: "Service is currently unavailable. Please try again later.",
};
