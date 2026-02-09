import * as v from "valibot";

export type StringDateMessages = {
	/**
	 * Message for when the value is not a valid date or date string
	 * @default "Invalid date format"
	 */
	invalidFormat?: string;
};

export function createStringDateSchema(messages?: StringDateMessages) {
	return v.union(
		[
			v.date(),
			v.pipe(v.string(), v.isoDateTime(messages?.invalidFormat ?? "Invalid date-time format"))
		],
		messages?.invalidFormat ?? "Invalid date format"
	);
}
export const stringDateSchema = createStringDateSchema();
