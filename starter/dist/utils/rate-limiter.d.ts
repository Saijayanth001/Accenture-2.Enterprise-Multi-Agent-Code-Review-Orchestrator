/**
 * Rate Limiter for API requests and token usage
 * Prevents exceeding Anthropic API rate limits
 *
 * This implements a token bucket algorithm with sliding window.
 *
 * Concepts:
 * - Tracks requests and tokens used in the last 60 seconds (sliding window)
 * - Limits concurrent requests to prevent overwhelming the API
 * - Uses token estimation to prevent exceeding token-per-minute limits
 */
export interface RateLimiterConfig {
    /** Maximum requests per minute */
    maxRequestsPerMinute: number;
    /** Maximum tokens per minute */
    maxTokensPerMinute: number;
    /** Maximum concurrent requests */
    maxConcurrent: number;
}
export declare const DEFAULT_RATE_LIMITS: RateLimiterConfig;
/**
 * Token bucket rate limiter with sliding window
 */
export declare class RateLimiter {
    private config;
    private requestHistory;
    private activeRequests;
    private waitQueue;
    constructor(config?: Partial<RateLimiterConfig>);
    /**
     * Wait until a request can be made within rate limits
     *
     * This is the main entry point for rate limiting.
     * It ensures:
     * 1. Concurrent request limit is not exceeded
     * 2. Request and token rate limits are respected
     * 3. The request is recorded for future rate limit calculations
     *
     * @param estimatedTokens - Estimated tokens for this request
     */
    acquire(estimatedTokens?: number): Promise<void>;
    /**
     * Release a request slot after completion
     * @param actualTokens - Actual tokens used (updates estimate)
     */
    release(actualTokens?: number): void;
    /**
     * Get current rate limit status
     */
    getStatus(): {
        activeRequests: number;
        requestsInWindow: number;
        tokensInWindow: number;
        availableRequests: number;
        availableTokens: number;
    };
    /**
     * Check if request can proceed immediately
     *
     * @param estimatedTokens - Estimated tokens for the request
     * @returns true if the request can proceed without waiting
     */
    canProceed(estimatedTokens?: number): boolean;
    /**
     * Wait for a concurrent request slot to become available
     *
     * This creates a Promise that resolves when release() is called
     * and there's a queued waiter.
     */
    private waitForSlot;
    /**
     * Wait until rate limits allow the request to proceed
     *
     * This implements the sliding window algorithm.
     * If we can't proceed immediately, we calculate how long to wait
     * until the oldest request expires (falls out of the 60-second window).
     *
     * @param estimatedTokens - Estimated tokens for the request
     */
    private waitForRateLimit;
    /**
     * Remove request records older than 60 seconds (sliding window)
     *
     * This is called before checking rate limits to ensure we only
     * count requests in the current 60-second window.
     */
    private pruneOldRecords;
}
/**
 * Wrap an async function with rate limiting
 *
 * This is a convenience function for applying rate limiting to any async operation.
 */
export declare function withRateLimit<T>(rateLimiter: RateLimiter, fn: () => Promise<T>, estimatedTokens?: number): Promise<T>;
export declare const globalRateLimiter: RateLimiter;
//# sourceMappingURL=rate-limiter.d.ts.map