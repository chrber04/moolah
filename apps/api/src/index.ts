/**
 * WHAT IS THIS FILE?
 *
 * This is the main entrypoint for the Cloudflare Worker.
 *
 * - `export class API` is a named export that extends `WorkerEntrypoint`.
 *   It exposes RPC modules (users, auth, boosts, stats) for service bindings.
 *   Other workers (like web) can call `env.API.users.getUser()` etc.
 *
 * - `export default app` handles direct HTTP requests to this worker.
 *   When someone hits the API URL directly, Wrangler routes to this Hono app.
 *
 * In short:
 *   `API` class = RPC for service bindings (web → api)
 *   `default app` = HTTP requests (browser/client → api)
 */

import { WorkerEntrypoint } from "cloudflare:workers";

import type { EnvConfig } from "./env";
import { app } from "./app";

/**
 * The environment bindings for the Cloudflare Worker.
 */
export interface Env extends EnvConfig {
	DB: D1Database;
	KV: KVNamespace;
}

/**
 * The main entrypoint for the Cloudflare Worker.
 */
export class ClientAPI extends WorkerEntrypoint<Env> {


	async ping() {
		return "pong";
	}

	override async fetch(request: Request) {
		return app.fetch(request, this.env, this.ctx);
	}
}


/**
 * Admin API entrypoint.
 * Exposes admin-only RPC modules for service bindings.
 * Only bind this to trusted admin workers.
 */
export class AdminAPI extends WorkerEntrypoint<Env> {
	async ping() {
		return "admin-pong";
	}

	override async fetch(request: Request) {
		return app.fetch(request, this.env, this.ctx);
	}
}

export default app;
