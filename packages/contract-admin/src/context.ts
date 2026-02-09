import type * as v from "valibot";

import { baseRequestContextSchema } from "@moolah/core/rpc";

/**
 * Admin request context - metadata passed with every admin API call.
 *
 * Currently identical to BaseRequestContext. Extend with admin-specific
 * fields as needed (e.g., adminId, permissions, audit logging).
 */
export const adminRequestContextSchema = baseRequestContextSchema;
export type AdminRequestContext = v.InferOutput<typeof adminRequestContextSchema>;
