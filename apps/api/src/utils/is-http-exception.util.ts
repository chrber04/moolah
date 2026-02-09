import { HttpException } from "$exceptions/http.exception";

/**
 * Checks if the provided error is an instance of {@link HttpException}.
 *
 * @example
 * try {
 *   // Some error-prone code
 * } catch (error) {
 *   if (isHttpException(error)) {
 *     console.log("Caught an HttpException:", error.message);
 *     console.log("Status code:", error.statusCode);
 *     console.log("Error code:", error.errorCode);
 *     console.log("Message key:", error.messageKey);
 *   } else {
 *     console.log("Caught an unknown error:", error);
 *   }
 * }
 *
 * @param error - The error to check
 * @returns Whether the error is an instance of {@link HttpException}
 */
export const isHttpException = (error: unknown): error is HttpException => {
	return error instanceof HttpException;
};
