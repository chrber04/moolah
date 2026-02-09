/**
 * User account type.
 *
 *
 */
export interface User {
	id: string;
	discordId: string;
	username: string;
	discriminator?: string;
	avatarUrl?: string;
	email?: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Public user profile (limited info).
 *
 *
 */
export interface UserProfile {
	id: string;
	username: string;
	avatarUrl?: string;
	serverCount: number;
	reviewCount: number;
	joinedAt: string;
}
