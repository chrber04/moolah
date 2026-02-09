/* eslint-disable @typescript-eslint/naming-convention */
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

/**
 * Adds `children` snippet to any props type
 */
export type WithChildren<T = object> = T & {
	children?: Snippet;
};

/**
 * Adds element ref binding to any props type
 */
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null;
};

/**
 * Removes `child` prop from a type (useful when wrapping bits-ui)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;

/**
 * Removes `children` prop from a type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;

/**
 * Removes both `child` and `children` props from a type
 */
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;

/**
 * Combines variant props + HTML attributes + children snippet
 * Use for styled components with CVA variants
 */
export type ComponentProps<Variants, Element extends HTMLElement = HTMLElement> = Variants &
	HTMLAttributes<Element> &
	WithChildren;
