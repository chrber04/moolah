/**
 * Seeds the users table with sample data
 * Generates realistic user distribution with various roles
 */
import type { LibSQLDatabase } from "drizzle-orm/libsql";

import { users } from "@moolah/database";

import { usersData } from "../data/index.js";

export async function seedUsers(db: LibSQLDatabase) {
	console.log("👥 Seeding user data...");

	// Insert users in batches to avoid SQLite limits
	const BATCH_SIZE = 50;
	let totalInserted = 0;

	for (let i = 0; i < usersData.length; i += BATCH_SIZE) {
		const batch = usersData.slice(i, i + BATCH_SIZE);
		await db.insert(users).values(batch);
		totalInserted += batch.length;
	}

	console.log(`  ✅ Created ${totalInserted} users`);

	// Log role distribution
	const roleCounts = usersData.reduce(
		(acc, user) => {
			const role = user.role ?? "REGULAR";
			acc[role] = (acc[role] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>
	);

	console.log("  📊 Role distribution:");
	for (const [role, count] of Object.entries(roleCounts).sort((a, b) => b[1] - a[1])) {
		console.log(`     ${role}: ${count}`);
	}

	const bannedCount = usersData.filter((u) => u.deletedAt !== null).length;
	console.log(`  🚫 Banned users: ${bannedCount}`);

	console.log("👥 User seeding complete!\n");
}
