import { ReviewReport } from './types/report-types.js';
import { CodeQualityResult, TestCoverageResult, RefactoringSuggestion } from './types/analysis-results.js';
import { RateLimiterConfig } from './utils/rate-limiter.js';
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
    analyzeFile(file: string, owner?: string, repo?: string): Promise<{
        file: string;
        codeQuality: CodeQualityResult;
        testCoverage: TestCoverageResult;
        refactorings: RefactoringSuggestion;
    }>;
    /**
     * Run an async function with rate limiting
     */
    private runWithRateLimit;
    /**
     * Extract file list from agent response or string content
     */
    extractFileList(response: unknown): string[];
    /**
     * Calculate summary statistics from all file reviews
     */
    calculateSummary(fileReviews: Array<{
        file: string;
        codeQuality: CodeQualityResult;
        testCoverage: TestCoverageResult;
        refactorings: RefactoringSuggestion;
    }>): {
        totalFiles: number;
        overallScore: number;
        criticalIssues: number;
        highPriorityTests: number;
        refactoringOpportunities: number;
    };
    /**
     * Generate top recommendations from all file reviews
     */
    generateRecommendations(fileReviews: Array<{
        file: string;
        codeQuality: CodeQualityResult;
        testCoverage: TestCoverageResult;
        refactorings: RefactoringSuggestion;
    }>): {
        priority: "critical" | "high" | "medium" | "low";
        category: string;
        description: string;
        files: string[];
    }[];
    /**
     * Create an empty report when no files are found
     */
    private createEmptyReport;
}
//# sourceMappingURL=orchestrator.d.ts.map