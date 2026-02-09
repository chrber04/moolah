/**
 * Database seed runner
 * Run with: pnpm db:seed
 *
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import {
	users
} from "@moolah/database";

import {  seedUsers } from "./seeders/index.js";

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const D1_ROOT = path.resolve(__dirname, "../../.wrangler/state/v3/d1/miniflare-D1DatabaseObject");

function findFirstSqlite(dir: string): string | null {
	if (!fs.existsSync(dir)) return null;

	const entries = fs.readdirSync(dir);
	const sqlite = entries.find((f) => f.endsWith(".sqlite"));

	return sqlite ? path.join(dir, sqlite) : null;
}

async function seed() {
	const sqlitePath = findFirstSqlite(D1_ROOT);

	if (!sqlitePath) {
		console.error(`No .sqlite found in ${D1_ROOT}`);
		console.error("Run 'pnpm dev' first to create the local database");
		process.exit(1);
	}

	const client = createClient({
		url: `file:${sqlitePath}`
	});

	const db = drizzle(client);

	console.log("🌱 Starting database seed...\n");

	// Clear all tables in correct order (children before parents due to foreign keys)
	console.log("🧹 Clearing existing data...");

	// Blog relationships first (children)

	// Users last (referenced by servers)
	await db.delete(users);

	console.log("  ✅ All tables cleared\n");

	// Run seeders (order matters - users first, then servers which reference users)
	await seedUsers(db);

	console.log("✨ All seeds completed successfully!");
}

seed()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error("❌ Seed failed:", err);
		process.exit(1);
	});
