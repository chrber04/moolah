/**
 * @moolah/database
 *
 * Single entry point for all database exports (Prisma-style)
 * Schema tables and inferred types in one place.
 *
 * Usage:
 *   import { blogPosts, type BlogPost } from "@moolah/database";
 *
 */

// ─────────────────────────────────────────────────────────────────
// Schema Tables
// ─────────────────────────────────────────────────────────────────
export {
	users,
} from "./schema/index.js";

// ─────────────────────────────────────────────────────────────────
// Inferred Types (Select)
// ─────────────────────────────────────────────────────────────────
export type {
	User,
} from "./schema/index.js";

// ─────────────────────────────────────────────────────────────────
// Inferred Types (Insert)
// ─────────────────────────────────────────────────────────────────
export type {
	InsertUser,
} from "./schema/index.js";
