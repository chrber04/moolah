import * as v from "valibot";

import { adminUserDetailDtoSchema } from "./common.js";

export const adminGetUserInputSchema = v.object({
	userId: v.string()
});
export type AdminGetUserInput = v.InferOutput<typeof adminGetUserInputSchema>;

export const adminGetUserOutputSchema = v.union([adminUserDetailDtoSchema, v.null()]);
export type AdminGetUserOutput = v.InferOutput<typeof adminGetUserOutputSchema>;
