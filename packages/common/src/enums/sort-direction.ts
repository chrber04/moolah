/**
 * Sort direction for list queries.
 *
 * @example
 * const direction: SortDirection = SortDirection.DESC;
 * // console.log(direction) -> "desc"
 */
export const SortDirection = {
	ASC: "asc",
	DESC: "desc"
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];
