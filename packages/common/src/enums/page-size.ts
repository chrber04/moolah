/**
 * Standardized page sizes for list pagination.
 *
 * @example
 * const size: PageSize = PageSize.DEFAULT;
 * // console.log(size) -> 24
 */
export const PageSize = {
	MIN: 1,
	DEFAULT: 24,
	MAX: 100
} as const;

export type PageSize = (typeof PageSize)[keyof typeof PageSize];
