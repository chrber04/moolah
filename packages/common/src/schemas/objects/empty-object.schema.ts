import * as v from "valibot";

export type EmptyObjectMessages = {
	/**
	 * Message for when the value is invalid
	 * @default "No data expected"
	 */
	invalid?: string;
};

export function createEmptyObjectSchema(messages?: EmptyObjectMessages) {
	return v.strictObject({}, messages?.invalid ?? "No data expected");
}

export const emptyObjectSchema = createEmptyObjectSchema();
export type EmptyObject = v.InferInput<typeof emptyObjectSchema>;
