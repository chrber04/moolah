import * as v from "valibot";

export type OrderDirectionMessages = {
	/**
	 * Message for when the value is not a valid order direction
	 * @default "Invalid order direction. Must be 'asc' or 'desc'"
	 */
	invalidValue?: string;
};

/**
 * Creates a schema for specifying sort order direction.
 *
 * @example
 * orderBy: { createdAt: "desc" }
 */
export function createOrderDirectionSchema(messages?: OrderDirectionMessages) {
	return v.union(
		[v.literal("asc"), v.literal("desc")],
		messages?.invalidValue ?? "Invalid order direction. Must be 'asc' or 'desc'"
	);
}
export const orderDirectionSchema = createOrderDirectionSchema();
