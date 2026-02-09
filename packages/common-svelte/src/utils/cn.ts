import type { ClassValue } from "clsx";
import { clsx } from "clsx";

/**
 * Merges class names using clsx.
 * Handles conditional classes.
 */
export const cn = (...classes: ClassValue[]) => clsx(classes);
