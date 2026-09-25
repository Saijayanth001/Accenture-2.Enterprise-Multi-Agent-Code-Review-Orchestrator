/**
 * Custom error class for review operations
 */
export declare class ReviewError extends Error {
    code: string;
    metadata?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, metadata?: Record<string, unknown> | undefined);
}
/**
 * Error codes for the review system
 */
export declare const ErrorCodes: {
    readonly MISSING_API_KEY: "MISSING_API_KEY";
    readonly MISSING_GITHUB_TOKEN: "MISSING_GITHUB_TOKEN";
    readonly INVALID_CONFIG: "INVALID_CONFIG";
    readonly PR_NOT_FOUND: "PR_NOT_FOUND";
    readonly FILE_NOT_FOUND: "FILE_NOT_FOUND";
    readonly GITHUB_API_ERROR: "GITHUB_API_ERROR";
    readonly RATE_LIMITED: "RATE_LIMITED";
    readonly AGENT_TIMEOUT: "AGENT_TIMEOUT";
    readonly AGENT_FAILED: "AGENT_FAILED";
    readonly STRUCTURED_OUTPUT_FAILED: "STRUCTURED_OUTPUT_FAILED";
    readonly RETRY_EXHAUSTED: "RETRY_EXHAUSTED";
    readonly VALIDATION_FAILED: "VALIDATION_FAILED";
    readonly UNKNOWN_ERROR: "UNKNOWN_ERROR";
};
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
/**
 * Retry utility with exponential backoff
 *
 * This function implements the retry pattern with exponential backoff and jitter.
 *
 * Algorithm:
 * 1. Try to execute the function
 * 2. If it succeeds, return the result
 * 3. If it fails and retries remain:
 *    - Calculate backoff delay: delayMs * 2^(attempt - 1)
 *    - Add jitter (random 0-100ms) to prevent thundering herd
 *    - Wait for the calculated duration
 *    - Retry
 * 4. If all retries exhausted, throw ReviewError with RETRY_EXHAUSTED code
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param delayMs - Base delay in milliseconds (default: 1000)
 * @returns The result of the successful function execution
 * @throws ReviewError with RETRY_EXHAUSTED code if all retries fail
 */
export declare function withRetry<T>(fn: () => Promise<T>, maxRetries?: number, delayMs?: number): Promise<T>;
/**
 * Wrap an async function with timeout
 *
 * This function races the provided function against a timeout.
 * Whichever completes first wins.
 *
 * @param fn - Async function to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param errorMessage - Custom error message
 * @returns The result of the function if it completes before timeout
 * @throws ReviewError with AGENT_TIMEOUT code if timeout is reached
 */
export declare function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number, errorMessage?: string): Promise<T>;
/**
 * Check if an error is a ReviewError
 */
export declare function isReviewError(error: unknown): error is ReviewError;
/**
 * Format error for logging/display
 */
export declare function formatError(error: unknown): string;
//# sourceMappingURL=error-handler.d.ts.map