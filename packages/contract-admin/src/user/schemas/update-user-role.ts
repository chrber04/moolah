import * as v from "valibot";

import { UserRole } from "@moolah/domain/user";

import { adminMutationResultDtoSchema } from "./common.js";

export const adminUpdateUserRoleInputSchema = v.object({
	userId: v.string(),
	role: v.enum(UserRole)
});
export type AdminUpdateUserRoleInput = v.InferOutput<typeof adminUpdateUserRoleInputSchema>;

export const adminUpdateUserRoleOutputSchema = adminMutationResultDtoSchema;
export type AdminUpdateUserRoleOutput = v.InferOutput<typeof adminUpdateUserRoleOutputSchema>;
