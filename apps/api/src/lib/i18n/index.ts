import { en } from "$locales/en.js";
import { es } from "$locales/es.js";

import type { Locale } from "@moolah/core/i18n";
import { DEFAULT_LOCALE } from "@moolah/core/i18n";

import type { MessageKey, Messages } from "./schema.js";

/**
 * All locales must be implemented.
 * TypeScript will error if a locale from @moolah/core/i18n is missing.
 */
const locales: Record<Locale, Messages> = {
	en,
	es
};

/**
 * Get translated message for a key.
 * Falls back to default locale if requested locale is not available.
 */
export function getMessage(key: MessageKey, locale: string): string {
	const messages: Messages = locales[locale as Locale] ?? locales[DEFAULT_LOCALE];
	return messages[key];
}

export type { MessageKey, Messages } from "./schema.js";
