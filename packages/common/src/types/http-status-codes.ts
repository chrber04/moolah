// Informational responses (100–199)
export type HttpInfoStatusCode = 100 | 101 | 102 | 103;

// Successful responses (200–299)
export type HttpSuccessStatusCode = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226;

// Redirection messages (300–399)
export type HttpRedirectStatusCode = 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308;

// Client error responses (400–499)
export type HttpClientErrorStatusCode =
	| 400
	| 401
	| 402
	| 403
	| 404
	| 405
	| 406
	| 407
	| 408
	| 409
	| 410
	| 411
	| 412
	| 413
	| 414
	| 415
	| 416
	| 417
	| 418
	| 421
	| 422
	| 423
	| 424
	| 425
	| 426
	| 428
	| 429
	| 431
	| 451;

// Server error responses (500–599)
export type HttpServerErrorStatusCode =
	| 500
	| 501
	| 502
	| 503
	| 504
	| 505
	| 506
	| 507
	| 508
	| 510
	| 511;

/**
 * `HttpUnofficialStatusCode` can be used to specify an unofficial status code.
 * This is useful when you want to define application-specific HTTP status codes
 * that are not part of the standard HTTP status codes.
 *
 * @example
 * Using an unofficial status code:
 * ```ts
 * return response.send("Unknown Error", 520 as HttpUnofficialStatusCode);
 * ```
 */
export type HttpUnofficialStatusCode = -1;

/**
 * This type represents all possible HTTP status codes, including unofficial ones
 * that might be used for specific scenarios in an application.
 */
export type HttpStatusCode =
	| HttpInfoStatusCode
	| HttpSuccessStatusCode
	| HttpRedirectStatusCode
	| HttpClientErrorStatusCode
	| HttpServerErrorStatusCode
	| HttpUnofficialStatusCode;

export type HttpContentlessStatusCode = 101 | 204 | 205 | 304;
export type HttpContentfulStatusCode = Exclude<HttpStatusCode, HttpContentlessStatusCode>;
