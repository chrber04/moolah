import * as v from "valibot";

import { currentAdminUserDtoSchema } from "./common.js";

/** User ID comes from authenticated admin session */
export const getCurrentAdminUserInputSchema = v.object({
	userId: v.string()
});
export type GetCurrentAdminUserInput = v.InferOutput<typeof getCurrentAdminUserInputSchema>;

export const getCurrentAdminUserOutputSchema = currentAdminUserDtoSchema;
export type GetCurrentAdminUserOutput = v.InferOutput<typeof getCurrentAdminUserOutputSchema>;
