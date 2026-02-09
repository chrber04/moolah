import { InternalException } from "$exceptions/internal.exception";

/**
 * Checks if the provided error is an instance of {@link InternalException}.
 *
 * @example
 * try {
 *   // Some error-prone code
 * } catch (error) {
 *   if (isInternalException(error)) {
 *     console.log("Caught an InternalException:", error.message);
 *     console.log("Cause:", error.cause);
 *     console.log("Metadata:", error.metadata);
 *     console.log("Context:", error.context);
 *     console.log("Tags:", error.tags);
 *   } else {
 *     console.log("Caught an unknown error:", error);
 *   }
 * }
 *
 * @param error - The error to check
 * @returns Whether the error is an instance of {@link InternalException}
 */
export const isInternalException = (error: unknown): error is InternalException => {
	return error instanceof InternalException;
};
