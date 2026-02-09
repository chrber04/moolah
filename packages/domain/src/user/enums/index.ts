/**
 * User role levels for access control
 *
 *
 */
export const UserRole = {
	REGULAR: "REGULAR",
	MODERATOR: "MODERATOR",
	SUPPORT: "SUPPORT",
	ADMIN: "ADMIN",
	SUPER_ADMIN: "SUPER_ADMIN"
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
