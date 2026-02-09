import { and, count, desc, eq, isNotNull, isNull, like, or } from "drizzle-orm";

import type {
	AdminBanUserInput,
	AdminGetUserInput,
	AdminGetUserOutput,
	AdminGetUsersInput,
	AdminGetUsersOutput,
	AdminMutationResultDto,
	AdminUnbanUserInput,
	AdminUpdateUserRoleInput,
	AdminUserDetailDto,
	AdminUserRowDto
} from "@moolah/contract-admin/user";
import { users } from "@moolah/database";
import { UserRole } from "@moolah/domain/user";

import type { RequestContext } from "$lib/context";
import { BadRequestException, NotFoundException } from "$exceptions/http.exception";

// -------------------------------------
// Transformers (DB record → DTO)
// -------------------------------------

type DbUser = typeof users.$inferSelect;

function toAdminUserRowDto(user: DbUser): AdminUserRowDto {
	return {
		id: user.id,
		discordId: user.discordId,
		role: user.role,
		displayName: user.displayName,
		avatarUrl: user.avatarUrl,
		email: user.email,
		createdAt: user.createdAt,
		deletedAt: user.deletedAt
	};
}

function toAdminUserDetailDto(user: DbUser): AdminUserDetailDto {
	return {
		id: user.id,
		discordId: user.discordId,
		role: user.role,
		displayName: user.displayName,
		avatarUrl: user.avatarUrl,
		email: user.email,
		emailIsVerified: user.emailIsVerified,
		wantsProfilePublic: user.wantsProfilePublic,
		wantsMarketingEmails: user.wantsMarketingEmails,
		wantsServiceEmails: user.wantsServiceEmails,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		deletedAt: user.deletedAt
	};
}

// -------------------------------------
// Service Functions
// -------------------------------------

/**
 * Fetches a single user by ID for admin detail view.
 */
export async function getUser(
	ctx: RequestContext,
	input: AdminGetUserInput
): Promise<AdminGetUserOutput> {
	const user = await ctx.db.query.users.findFirst({
		where: eq(users.id, input.userId)
	});

	if (!user) {
		return null;
	}

	return toAdminUserDetailDto(user);
}

/**
 * Fetches paginated users for admin table.
 */
export async function getUsers(
	ctx: RequestContext,
	input: AdminGetUsersInput
): Promise<AdminGetUsersOutput> {
	const { search, role, includeDeleted = false, page = 1, limit = 25 } = input;
	const offset = (page - 1) * limit;

	const conditions: ReturnType<typeof eq>[] = [];

	if (!includeDeleted) {
		conditions.push(isNull(users.deletedAt));
	}

	if (role) {
		conditions.push(eq(users.role, role));
	}

	if (search) {
		const searchPattern = `%${search}%`;
		// Search across user ID, display name, discord ID, and email
		conditions.push(
			or(
				like(users.id, searchPattern),
				like(users.displayName, searchPattern),
				like(users.discordId, searchPattern),
				like(users.email, searchPattern)
			)!
		);
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const [{ count: totalCount }] = await ctx.db
		.select({ count: count() })
		.from(users)
		.where(whereClause);

	const userRows = await ctx.db
		.select()
		.from(users)
		.where(whereClause)
		.orderBy(desc(users.createdAt))
		.limit(limit)
		.offset(offset);

	return {
		users: userRows.map(toAdminUserRowDto),
		total: totalCount,
		totalPages: Math.ceil(totalCount / limit),
		page
	};
}

/**
 * Updates a user's role.
 * Cannot change SUPER_ADMIN role.
 */
export async function updateUserRole(
	ctx: RequestContext,
	input: AdminUpdateUserRoleInput
): Promise<AdminMutationResultDto> {
	const { userId, role } = input;

	const user = await ctx.db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: { id: true, role: true }
	});

	if (!user) {
		throw new NotFoundException();
	}

	if (user.role === UserRole.SUPER_ADMIN) {
		throw new BadRequestException({
			messageKey: "global_exception_forbidden"
		});
	}

	await ctx.db.update(users).set({ role }).where(eq(users.id, userId));

	return { success: true, id: userId };
}

/**
 * Soft-deletes (bans) a user by setting deletedAt.
 * Cannot ban SUPER_ADMIN users.
 */
export async function banUser(
	ctx: RequestContext,
	input: AdminBanUserInput
): Promise<AdminMutationResultDto> {
	const { userId } = input;

	const user = await ctx.db.query.users.findFirst({
		where: eq(users.id, userId),
		columns: { id: true, role: true, deletedAt: true }
	});

	if (!user) {
		throw new NotFoundException();
	}

	if (user.role === UserRole.SUPER_ADMIN) {
		throw new BadRequestException({
			messageKey: "global_exception_forbidden"
		});
	}

	if (user.deletedAt) {
		throw new BadRequestException({
			messageKey: "global_exception_conflict"
		});
	}

	await ctx.db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, userId));

	return { success: true, id: userId };
}

/**
 * Restores (unbans) a soft-deleted user by clearing deletedAt.
 */
export async function unbanUser(
	ctx: RequestContext,
	input: AdminUnbanUserInput
): Promise<AdminMutationResultDto> {
	const { userId } = input;

	const user = await ctx.db.query.users.findFirst({
		where: and(eq(users.id, userId), isNotNull(users.deletedAt)),
		columns: { id: true }
	});

	if (!user) {
		throw new NotFoundException();
	}

	await ctx.db.update(users).set({ deletedAt: null }).where(eq(users.id, userId));

	return { success: true, id: userId };
}
