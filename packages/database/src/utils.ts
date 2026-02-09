import { sql } from "drizzle-orm";
import { integer, text } from "drizzle-orm/sqlite-core";

/**
 * Standard UUID primary key column
 * Uses crypto.randomUUID() for generation
 *
 *
 */
export const primaryId = text("id")
	.primaryKey()
	.$defaultFn(() => crypto.randomUUID());

export const createdAt = integer("created_at", { mode: "timestamp" })
	.notNull()
	.default(sql`(unixepoch())`);

export const updatedAt = integer("updated_at", { mode: "timestamp" })
	.notNull()
	.default(sql`(unixepoch())`)
	.$onUpdate(() => new Date());

export const deletedAt = integer("deleted_at", { mode: "timestamp" });

export const timestamps = {
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`)
		.$onUpdate(() => new Date())
};

export const softDeletableTimestamps = {
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(unixepoch())`)
		.$onUpdate(() => new Date()),
	deletedAt: integer("deleted_at", { mode: "timestamp" })
};
