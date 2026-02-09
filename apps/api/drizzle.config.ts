/**
 * Drizzle Kit configuration for generating migrations
 * Schema is imported from @moolah/database package
 *
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "sqlite",
	schema: "./src/database/schema.ts",
	out: "./drizzle/migrations",
	driver: "d1-http"
});
