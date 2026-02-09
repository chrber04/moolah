import * as v from "valibot";

import { displayNameSchema } from "@moolah/common/schemas";

export const updateCurrentUserDisplayNameInputSchema = v.object({
	userId: v.string(),
	displayName: displayNameSchema
});
export type UpdateCurrentUserDisplayNameInput = v.InferOutput<
	typeof updateCurrentUserDisplayNameInputSchema
>;

/** Returns the new display name */
export const updateCurrentUserDisplayNameOutputSchema = v.string();
export type UpdateCurrentUserDisplayNameOutput = v.InferOutput<
	typeof updateCurrentUserDisplayNameOutputSchema
>;
