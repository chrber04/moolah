// Server types
export interface Server {
	id: string;
	name: string;
	description: string;
	icon?: string;
	banner?: string;
	memberCount: number;
	onlineCount?: number;
	category: ServerCategory;
	tags: string[];
	isVerified: boolean;
	isPartnered: boolean;
	inviteUrl: string;
	createdAt: Date;
	bumpedAt?: Date;
}

export type ServerCategory =
	| "gaming"
	| "anime"
	| "technology"
	| "music"
	| "art"
	| "community"
	| "education"
	| "entertainment"
	| "other";

export type ServerTier = "s" | "a" | "b" | "c" | "d";

// User types
export interface User {
	id: string;
	username: string;
	discriminator?: string;
	avatar?: string;
	servers: string[];
	createdAt: Date;
}

// Search types
export interface SearchFilters {
	category?: ServerCategory;
	minMembers?: number;
	maxMembers?: number;
	hasVoice?: boolean;
	isVerified?: boolean;
	isPartnered?: boolean;
	language?: string;
}

export interface SearchResult {
	servers: Server[];
	total: number;
	page: number;
	pageSize: number;
}

// API response types
export interface ApiResponse<T> {
	data: T;
	success: boolean;
	error?: string;
}

export interface PaginatedResponse<T> {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
	hasMore: boolean;
}
