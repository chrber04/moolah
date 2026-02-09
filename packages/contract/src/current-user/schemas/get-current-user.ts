import * as v from "valibot";

import { currentUserDtoSchema } from "./common.js";

/** User ID comes from authenticated session */
export const getCurrentUserInputSchema = v.object({
	userId: v.string()
});
export type GetCurrentUserInput = v.InferOutput<typeof getCurrentUserInputSchema>;

export const getCurrentUserOutputSchema = currentUserDtoSchema;
export type GetCurrentUserOutput = v.InferOutput<typeof getCurrentUserOutputSchema>;
