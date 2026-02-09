/**
 * Cookie names - all cookies prefixed with project slug.
 * Split into server-side (httpOnly) and client-side cookies.
 */

import { projectConfig } from "../configs/project.config.js";

const COOKIE_PREFIX = projectConfig.slug;

/**
 * Server-side cookie names (httpOnly, secure).
 * These cookies are set by the server and not accessible via JavaScript.
 *
 * @example
 * import { CookieName } from "@moolah/core/enums";
 * cookies.set(CookieName.ACCESS_TOKEN, token, { httpOnly: true });
 */
export const CookieName = {
	ACCESS_TOKEN: `${COOKIE_PREFIX}_access_token`,
	REFRESH_TOKEN: `${COOKIE_PREFIX}_refresh_token`,
	OAUTH_STATE: `${COOKIE_PREFIX}_oauth_state`,
	OAUTH_CODE_VERIFIER: `${COOKIE_PREFIX}_oauth_code_verifier`
} as const;
export type CookieName = (typeof CookieName)[keyof typeof CookieName];

/**
 * Client-side cookie names (accessible via JavaScript).
 * These cookies store user preferences and are readable by the browser.
 *
 * @example
 * import { ClientCookieName } from "@moolah/core/enums";
 * document.cookie = `${ClientCookieName.LANGUAGE}=en`;
 */
export const ClientCookieName = {
	LANGUAGE: `${COOKIE_PREFIX}_lang`
} as const;
export type ClientCookieName = (typeof ClientCookieName)[keyof typeof ClientCookieName];
