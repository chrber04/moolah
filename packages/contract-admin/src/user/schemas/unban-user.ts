import * as v from "valibot";

import { adminMutationResultDtoSchema } from "./common.js";

export const adminUnbanUserInputSchema = v.object({
	userId: v.string()
});
export type AdminUnbanUserInput = v.InferOutput<typeof adminUnbanUserInputSchema>;

export const adminUnbanUserOutputSchema = adminMutationResultDtoSchema;
export type AdminUnbanUserOutput = v.InferOutput<typeof adminUnbanUserOutputSchema>;
