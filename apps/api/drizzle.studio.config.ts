/**
 * Drizzle Studio configuration for local development
 * Connects to the local D1 SQLite database created by wrangler
 *
 */
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

const D1_ROOT = path.resolve(__dirname, ".wrangler/state/v3/d1/miniflare-D1DatabaseObject");

function findFirstSqlite(dir: string): string | null {
	if (!fs.existsSync(dir)) return null;

	const entries = fs.readdirSync(dir);
	const sqlite = entries.find((f) => f.endsWith(".sqlite"));

	return sqlite ? path.join(dir, sqlite) : null;
}

const sqlitePath = findFirstSqlite(D1_ROOT);

if (!sqlitePath) {
	console.error(`No .sqlite found in ${D1_ROOT}`);
	console.error("Run 'pnpm dev' first to create the local database");
	process.exit(1);
}

export default defineConfig({
	dialect: "sqlite",
	schema: "./src/database/schema.ts",
	dbCredentials: {
		url: `file:${sqlitePath}`
	}
});
