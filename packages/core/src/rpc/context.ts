import * as v from "valibot";

import { DEFAULT_LOCALE, Locale } from "../i18n";

/**
 * Base request context - common metadata for all RPC calls.
 *
 * - `id`: Request trace ID for observability (correlates logs across services)
 * - `locale`: For error messages and system responses
 */
export const baseRequestContextSchema = v.object({
	id: v.optional(v.string()),
	locale: v.optional(v.enum(Locale), DEFAULT_LOCALE)
});
export type BaseRequestContext = v.InferOutput<typeof baseRequestContextSchema>;
