/**
 * Custom error class for review operations
 */
export class ReviewError extends Error {
    code;
    metadata;
    constructor(message, code, metadata) {
        super(message);
        this.code = code;
        this.metadata = metadata;
        this.name = 'ReviewError';
        Error.captureStackTrace(this, ReviewError);
    }
}
/**
 * Error codes for the review system
 */
export const ErrorCodes = {
    // Configuration errors
    MISSING_API_KEY: 'MISSING_API_KEY',
    MISSING_GITHUB_TOKEN: 'MISSING_GITHUB_TOKEN',
    INVALID_CONFIG: 'INVALID_CONFIG',
    // GitHub errors
    PR_NOT_FOUND: 'PR_NOT_FOUND',
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    GITHUB_API_ERROR: 'GITHUB_API_ERROR',
    RATE_LIMITED: 'RATE_LIMITED',
    // Agent errors
    AGENT_TIMEOUT: 'AGENT_TIMEOUT',
    AGENT_FAILED: 'AGENT_FAILED',
    STRUCTURED_OUTPUT_FAILED: 'STRUCTURED_OUTPUT_FAILED',
    // General errors
    RETRY_EXHAUSTED: 'RETRY_EXHAUSTED',
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};
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
export async function withRetry(fn, maxRetries = 3, delayMs = 1000) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt === maxRetries) {
                break;
            }
            // Calculate exponential backoff with jitter
            const backoff = delayMs * Math.pow(2, attempt - 1);
            const jitter = Math.random() * 100;
            const delay = backoff + jitter;
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new ReviewError(`Failed after ${maxRetries} retries: ${lastError?.message}`, ErrorCodes.RETRY_EXHAUSTED, { maxRetries, originalError: lastError?.message });
}
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
export async function withTimeout(fn, timeoutMs, errorMessage = 'Operation timed out') {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new ReviewError(errorMessage, ErrorCodes.AGENT_TIMEOUT, { timeoutMs }));
        }, timeoutMs);
    });
    return Promise.race([fn(), timeoutPromise]);
}
/**
 * Check if an error is a ReviewError
 */
export function isReviewError(error) {
    return error instanceof ReviewError;
}
/**
 * Format error for logging/display
 */
export function formatError(error) {
    if (isReviewError(error)) {
        return `[${error.code}] ${error.message}`;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
//# sourceMappingURL=error-handler.js.map