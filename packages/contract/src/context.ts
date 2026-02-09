import type * as v from "valibot";

import { baseRequestContextSchema } from "@moolah/core/rpc";

/**
 * Client request context - metadata passed with every client API call.
 *
 * Currently identical to BaseRequestContext. Extend with client-specific
 * fields as needed (e.g., user session, feature flags).
 */
export const clientRequestContextSchema = baseRequestContextSchema;
export type ClientRequestContext = v.InferOutput<typeof clientRequestContextSchema>;
