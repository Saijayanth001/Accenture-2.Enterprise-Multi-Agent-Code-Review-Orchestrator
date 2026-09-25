import { ReviewReport } from './types/report-types';
import { RateLimiterConfig } from './utils/rate-limiter';
/**
 * Orchestrator configuration options
 */
export interface OrchestratorOptions {
    rateLimits?: Partial<RateLimiterConfig>;
    timeout?: number;
    maxRetries?: number;
}
/**
 * Main Code Review Orchestrator
 * Coordinates subagents to analyze pull requests and generate comprehensive reports
 */
export declare class CodeReviewOrchestrator {
    private rateLimiter;
    private timeout;
    private maxRetries;
    constructor(options?: OrchestratorOptions);
    /**
     * Review a pull request using parallel subagent analysis
     * @param owner - Repository owner
     * @param repo - Repository name
     * @param prNumber - Pull request number
     * @returns Complete review report
     */
    reviewPullRequest(owner: string, repo: string, prNumber: number): Promise<ReviewReport>;
    /**
     * Analyze a single file with all three subagents in parallel
     */
    private analyzeFile;
    /**
     * Run an async function with rate limiting
     */
    private runWithRateLimit;
    /**
     * Extract file list from agent response
     * This is a simple implementation - could be enhanced with structured output
     */
    private extractFileList;
    /**
     * Calculate summary statistics from all file reviews
     */
    private calculateSummary;
    /**
     * Generate top recommendations from all file reviews
     */
    private generateRecommendations;
    /**
     * Create an empty report when no files are found
     */
    private createEmptyReport;
}
//# sourceMappingURL=orchestrator.d.ts.map