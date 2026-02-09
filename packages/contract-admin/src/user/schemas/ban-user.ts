import * as v from "valibot";

import { uuidSchema } from "@moolah/common/schemas";

import { adminMutationResultDtoSchema } from "./common.js";

export const adminBanUserInputSchema = v.object({
	userId: uuidSchema
});
export type AdminBanUserInput = v.InferOutput<typeof adminBanUserInputSchema>;

export const adminBanUserOutputSchema = adminMutationResultDtoSchema;
export type AdminBanUserOutput = v.InferOutput<typeof adminBanUserOutputSchema>;
