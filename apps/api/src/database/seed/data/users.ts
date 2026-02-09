/**
 * User seed data for testing and development
 * Generates realistic user data with weighted role distribution
 */
import type { InsertUser } from "@moolah/database";
import { UserRole } from "@moolah/domain/user";

// ─────────────────────────────────────────────────────────────────
// Name Data
// ─────────────────────────────────────────────────────────────────

const firstNames = [
	"John",
	"Sarah",
	"Mike",
	"Emma",
	"Alex",
	"Chris",
	"Diana",
	"Ethan",
	"Fiona",
	"George",
	"Hannah",
	"Ivan",
	"Julia",
	"Kevin",
	"Laura",
	"Marcus",
	"Nina",
	"Oliver",
	"Paula",
	"Quinn",
	"Ryan",
	"Sophia",
	"Thomas",
	"Uma",
	"Victor",
	"Wendy",
	"Xavier",
	"Yuki",
	"Zara",
	"Adam",
	"Bella",
	"Carlos",
	"Daisy",
	"Eric",
	"Faith",
	"Gavin",
	"Hope",
	"Isaac",
	"Jade",
	"Kyle",
	"Luna",
	"Mason",
	"Nora",
	"Oscar",
	"Penelope",
	"Quentin",
	"Rosa",
	"Sam",
	"Tina",
	"Ulrich"
];

const lastNames = [
	"Smith",
	"Johnson",
	"Williams",
	"Brown",
	"Jones",
	"Garcia",
	"Miller",
	"Davis",
	"Rodriguez",
	"Martinez",
	"Anderson",
	"Taylor",
	"Thomas",
	"Moore",
	"Jackson",
	"Martin",
	"Lee",
	"Thompson",
	"White",
	"Lopez",
	"Harris",
	"Clark",
	"Lewis",
	"Walker",
	"Hall"
];

// ─────────────────────────────────────────────────────────────────
// Role Distribution
// ─────────────────────────────────────────────────────────────────

const allRoles: UserRole[] = [
	UserRole.SUPER_ADMIN,
	UserRole.ADMIN,
	UserRole.MODERATOR,
	UserRole.SUPPORT,
	UserRole.REGULAR
];

/**
 * Role weights for realistic distribution:
 * ~1% super admin, ~2% admin, ~5% moderator, ~5% support, ~87% regular
 */
const roleWeights = [1, 2, 5, 5, 87];

// ─────────────────────────────────────────────────────────────────
// Seeded Random Number Generator (for reproducible data)
// ─────────────────────────────────────────────────────────────────

function createSeededRandom(seed: number) {
	return function () {
		seed = (seed * 1103515245 + 12345) & 0x7fffffff;
		return seed / 0x7fffffff;
	};
}

// ─────────────────────────────────────────────────────────────────
// User Data Generator
// ─────────────────────────────────────────────────────────────────

function getWeightedRole(random: () => number): UserRole {
	const total = roleWeights.reduce((a, b) => a + b, 0);
	let value = Math.floor(random() * total);
	for (let i = 0; i < allRoles.length; i++) {
		const weight = roleWeights[i];
		const role = allRoles[i];
		if (weight === undefined || role === undefined) continue;
		value -= weight;
		if (value < 0) return role;
	}
	return UserRole.REGULAR;
}

function pickRandom<T>(arr: T[], random: () => number): T {
	return arr[Math.floor(random() * arr.length)] as T;
}

/**
 * Generates deterministic user seed data
 * Using a seeded RNG ensures the same data is generated each time
 */
export function generateUsersData(count: number, seed = 42): Omit<InsertUser, "id">[] {
	const random = createSeededRandom(seed);
	const users: Omit<InsertUser, "id">[] = [];

	// Base date: 2 years ago from a fixed point (for reproducibility)
	const baseDate = new Date("2024-01-01T00:00:00Z");
	const twoYearsMs = 730 * 24 * 60 * 60 * 1000;

	for (let i = 1; i <= count; i++) {
		const firstName = pickRandom(firstNames, random);
		const lastName = pickRandom(lastNames, random);
		const role = getWeightedRole(random);
		const isBanned = random() < 0.05; // 5% banned

		// Generate a random date in the past 2 years
		const createdAt = new Date(baseDate.getTime() - Math.floor(random() * twoYearsMs));

		// Banned users have a deletedAt date
		const deletedAt = isBanned
			? new Date(createdAt.getTime() + Math.floor(random() * 365 * 24 * 60 * 60 * 1000))
			: null;

		// 30% have email, verified proportionally
		const hasEmail = random() < 0.3;
		const email = hasEmail
			? `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`
			: null;
		const emailIsVerified = hasEmail && random() < 0.8;

		// 80% have avatar
		const hasAvatar = random() > 0.2;
		const avatarUrl = hasAvatar ? `https://cdn.discordapp.com/embed/avatars/${i % 5}.png` : null;

		// Random preference settings
		const wantsProfilePublic = random() < 0.4;
		const wantsMarketingEmails = random() < 0.15;
		const wantsServiceEmails = random() < 0.9;

		// Cookie consent (most accept essential, fewer accept others)
		const acceptsPerformanceCookies = random() < 0.3;
		const acceptsFunctionalCookies = random() < 0.5;
		const acceptsAdvertisingCookies = random() < 0.1;
		const acceptsAnalyticsCookies = random() < 0.25;

		users.push({
			// Discord ID: realistic snowflake format (18-19 digits)
			discordId: `${100000000000000000n + BigInt(i * 1000000 + Math.floor(random() * 999999))}`,
			role,
			displayName: `${firstName} ${lastName}`,
			avatarUrl,
			email,
			emailIsVerified,
			discordGuilds: null,
			discordGuildsUpdatedAt: null,
			wantsProfilePublic,
			wantsMarketingEmails,
			wantsServiceEmails,
			acceptsEssentialCookies: true,
			acceptsPerformanceCookies,
			acceptsFunctionalCookies,
			acceptsAdvertisingCookies,
			acceptsAnalyticsCookies,
			createdAt,
			updatedAt: createdAt,
			deletedAt
		});
	}

	return users;
}

/**
 * Pre-generated user data (106 users)
 * Using a fixed seed ensures consistent data across seed runs
 */
export const usersData = generateUsersData(106);
