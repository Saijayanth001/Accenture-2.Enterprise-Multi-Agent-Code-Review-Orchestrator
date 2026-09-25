import { query } from '@anthropic-ai/claude-agent-sdk';
import { mcpServersConfig } from './config/mcp.config';
import { buildOrchestratorPrompt } from './prompts';
import { analyzeCodeQuality, analyzeTestCoverage, suggestRefactorings } from './agents';
import { RateLimiter, DEFAULT_RATE_LIMITS } from './utils/rate-limiter';
import { withRetry, withTimeout, ErrorCodes, ReviewError } from './utils/error-handler';
import { logger } from './utils/logger';
/**
 * Main Code Review Orchestrator
 * Coordinates subagents to analyze pull requests and generate comprehensive reports
 */
export class CodeReviewOrchestrator {
    rateLimiter;
    timeout;
    maxRetries;
    constructor(options = {}) {
        this.rateLimiter = new RateLimiter(options.rateLimits || DEFAULT_RATE_LIMITS);
        this.timeout = options.timeout || 300000; // 5 minutes default
        this.maxRetries = options.maxRetries || 3;
    }
    /**
     * Review a pull request using parallel subagent analysis
     * @param owner - Repository owner
     * @param repo - Repository name
     * @param prNumber - Pull request number
     * @returns Complete review report
     */
    async reviewPullRequest(owner, repo, prNumber) {
        const startTime = Date.now();
        logger.info('Starting code review', { owner, repo, prNumber });
        const model = process.env.ANTHROPIC_MODEL;
        if (!model) {
            throw new ReviewError('ANTHROPIC_MODEL environment variable is required', ErrorCodes.MISSING_API_KEY);
        }
        try {
            // Get changed files from PR using GitHub MCP
            logger.info('Fetching PR files');
            const prompt = buildOrchestratorPrompt({ owner, repo, number: prNumber }) +
                `\n\nGet the list of changed files in PR #${prNumber} in ${owner}/${repo}. List only code files (.ts, .tsx, .js, .jsx, .py).`;
            let files = [];
            try {
                for await (const message of query({
                    prompt,
                    options: {
                        model,
                        mcpServers: {
                            github: mcpServersConfig.github
                        },
                        allowedTools: ['mcp__github__*']
                    }
                })) {
                    if (message.type === 'result' && message.subtype === 'success') {
                        files = this.extractFileList(message.result);
                        break;
                    }
                }
            }
            catch (error) {
                logger.error('Failed to fetch PR files', { error });
                // Fall back to mock data for testing
                files = [];
            }
            if (files.length === 0) {
                logger.warn('No code files found in PR');
                return this.createEmptyReport(owner, repo, prNumber, startTime);
            }
            logger.info(`Found ${files.length} files to analyze`, { files });
            // Analyze each file with all three subagents in parallel
            const fileReviews = await Promise.all(files.map(file => this.analyzeFile(file, owner, repo)));
            // Calculate summary statistics
            const summary = this.calculateSummary(fileReviews);
            // Generate top recommendations
            const recommendations = this.generateRecommendations(fileReviews);
            const duration = Date.now() - startTime;
            logger.info('Code review completed', {
                owner,
                repo,
                prNumber,
                totalFiles: summary.totalFiles,
                overallScore: summary.overallScore,
                duration
            });
            return {
                pullRequest: { owner, repo, number: prNumber },
                fileReviews,
                summary,
                recommendations,
                metadata: {
                    analyzedAt: new Date().toISOString(),
                    duration,
                    agentVersions: {
                        orchestrator: '1.0.0',
                        codeQuality: '1.0.0',
                        testCoverage: '1.0.0',
                        refactoring: '1.0.0'
                    }
                }
            };
        }
        catch (error) {
            logger.error('Code review failed', { error, owner, repo, prNumber });
            throw error;
        }
    }
    /**
     * Analyze a single file with all three subagents in parallel
     */
    async analyzeFile(file, owner, repo) {
        logger.info(`Analyzing file: ${file}`);
        // If owner and repo are provided, prepend to file path for GitHub context
        const fileContext = owner && repo ? `GitHub PR file from ${owner}/${repo}: ${file}` : file;
        try {
            // Spawn all three subagents in parallel with rate limiting
            const [codeQuality, testCoverage, refactorings] = await Promise.all([
                this.runWithRateLimit(() => analyzeCodeQuality(fileContext)),
                this.runWithRateLimit(() => analyzeTestCoverage(fileContext)),
                this.runWithRateLimit(() => suggestRefactorings(fileContext))
            ]);
            return { file, codeQuality, testCoverage, refactorings };
        }
        catch (error) {
            logger.error(`Failed to analyze file: ${file}`, { error });
            // Return empty results on failure to allow partial review
            return {
                file,
                codeQuality: {
                    file,
                    issues: [],
                    overallScore: 0,
                    summary: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                },
                testCoverage: {
                    file,
                    hasTests: false,
                    testFiles: [],
                    untestedPaths: [],
                    coverageEstimate: 0,
                    summary: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                },
                refactorings: {
                    file,
                    suggestions: [],
                    summary: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                }
            };
        }
    }
    /**
     * Run an async function with rate limiting
     */
    async runWithRateLimit(fn) {
        await this.rateLimiter.acquire(5000); // Estimate 5k tokens per request
        try {
            const result = await withRetry(() => withTimeout(fn, this.timeout, 'Agent timeout'), this.maxRetries);
            this.rateLimiter.release();
            return result;
        }
        catch (error) {
            this.rateLimiter.release();
            throw error;
        }
    }
    /**
     * Extract file list from agent response
     * This is a simple implementation - could be enhanced with structured output
     */
    extractFileList(response) {
        // For now, return empty array - in real implementation, parse from agent response
        // The agent should be configured to return structured file list
        const responseStr = typeof response === 'string' ? response : JSON.stringify(response);
        // Simple regex to extract file paths
        const filePattern = /(?:^|\s)([a-zA-Z0-9_\-./]+\.(?:ts|tsx|js|jsx|py))(?:\s|$)/g;
        const matches = [...responseStr.matchAll(filePattern)];
        return matches
            .map(m => m[1])
            .filter((file) => file !== undefined)
            .filter((file, index, self) => self.indexOf(file) === index);
    }
    /**
     * Calculate summary statistics from all file reviews
     */
    calculateSummary(fileReviews) {
        const totalFiles = fileReviews.length;
        const avgScore = fileReviews.reduce((sum, r) => sum + r.codeQuality.overallScore, 0) / totalFiles || 0;
        const criticalIssues = fileReviews.reduce((count, r) => count + r.codeQuality.issues.filter(i => i.severity === 'critical' || i.severity === 'high').length, 0);
        const highPriorityTests = fileReviews.reduce((count, r) => count + r.testCoverage.untestedPaths.filter(p => p.priority === 'critical' || p.priority === 'high').length, 0);
        const refactoringOpportunities = fileReviews.reduce((count, r) => count + r.refactorings.suggestions.length, 0);
        return {
            totalFiles,
            overallScore: Math.round(avgScore),
            criticalIssues,
            highPriorityTests,
            refactoringOpportunities
        };
    }
    /**
     * Generate top recommendations from all file reviews
     */
    generateRecommendations(fileReviews) {
        const recommendations = [];
        // Group critical security issues
        const securityIssues = fileReviews.filter(r => r.codeQuality.issues.some(i => i.category === 'security' && (i.severity === 'critical' || i.severity === 'high')));
        if (securityIssues.length > 0) {
            recommendations.push({
                priority: 'critical',
                category: 'Security',
                description: `Security vulnerabilities found in ${securityIssues.length} file(s)`,
                files: securityIssues.map(r => r.file)
            });
        }
        // Group high-priority test coverage gaps
        const testGaps = fileReviews.filter(r => r.testCoverage.untestedPaths.some(p => p.priority === 'critical' || p.priority === 'high'));
        if (testGaps.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'Testing',
                description: `Critical code paths missing test coverage in ${testGaps.length} file(s)`,
                files: testGaps.map(r => r.file)
            });
        }
        // Group high-impact refactorings
        const highImpactRefactorings = fileReviews.filter(r => r.refactorings.suggestions.some(s => s.impact === 'high'));
        if (highImpactRefactorings.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'Refactoring',
                description: `High-impact refactoring opportunities in ${highImpactRefactorings.length} file(s)`,
                files: highImpactRefactorings.map(r => r.file)
            });
        }
        return recommendations.slice(0, 10); // Return top 10
    }
    /**
     * Create an empty report when no files are found
     */
    createEmptyReport(owner, repo, prNumber, startTime) {
        return {
            pullRequest: { owner, repo, number: prNumber },
            fileReviews: [],
            summary: {
                totalFiles: 0,
                overallScore: 100,
                criticalIssues: 0,
                highPriorityTests: 0,
                refactoringOpportunities: 0
            },
            recommendations: [],
            metadata: {
                analyzedAt: new Date().toISOString(),
                duration: Date.now() - startTime,
                agentVersions: {
                    orchestrator: '1.0.0',
                    codeQuality: '1.0.0',
                    testCoverage: '1.0.0',
                    refactoring: '1.0.0'
                }
            }
        };
    }
}
//# sourceMappingURL=orchestrator.js.map