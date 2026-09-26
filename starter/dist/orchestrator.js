import { query } from '@anthropic-ai/claude-agent-sdk';
import { mcpServersConfig } from './config/mcp.config.js';
import { buildOrchestratorPrompt } from './prompts/index.js';
import { agentDefinitions, analyzeCodeQuality, analyzeTestCoverage, suggestRefactorings } from './agents/index.js';
import { RateLimiter, DEFAULT_RATE_LIMITS } from './utils/rate-limiter.js';
import { withRetry, withTimeout, ErrorCodes, ReviewError } from './utils/error-handler.js';
import { logger } from './utils/logger.js';
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
                        agents: agentDefinitions,
                        allowedTools: ['Task', 'Read', 'Skill', 'Grep', 'Glob', 'mcp__github__*'],
                        mcpServers: {
                            github: mcpServersConfig.github
                        }
                    }
                })) {
                    if (message.type === 'result' && message.subtype === 'success') {
                        files = this.extractFileList(message.result);
                        break;
                    }
                }
            }
            catch (error) {
                logger.error('Failed to fetch PR files via MCP', { error });
            }
            // Fallback: If query returned no files or failed, fetch files via GitHub REST API
            if (files.length === 0) {
                logger.info('Attempting REST API fallback to fetch PR files');
                try {
                    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`, {
                        headers: {
                            'User-Agent': 'CodeReviewOrchestrator',
                            ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {})
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (Array.isArray(data)) {
                            files = data
                                .map((f) => f.filename)
                                .filter((f) => /\.(ts|tsx|js|jsx|py|json)$/i.test(f));
                        }
                    }
                }
                catch (fallbackError) {
                    logger.error('REST API fallback failed', { error: fallbackError });
                }
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
     * Extract file list from agent response or string content
     */
    extractFileList(response) {
        if (!response)
            return [];
        const text = typeof response === 'string' ? response : JSON.stringify(response);
        // Try parsing as JSON if possible
        try {
            const parsed = typeof response === 'string' ? JSON.parse(response) : response;
            if (Array.isArray(parsed)) {
                return parsed
                    .map(f => (typeof f === 'string' ? f : f?.filename || f?.path || String(f)))
                    .map(f => f.trim().replace(/^[`"']|[`"']$/g, ''))
                    .filter(f => f.length > 0 && /\.(ts|tsx|js|jsx|py|json|md|css|html|rs|go|java|cpp|c|h|cs)$/i.test(f));
            }
            if (typeof parsed === 'object' && parsed !== null && Array.isArray(parsed.files)) {
                return parsed.files
                    .map((f) => (typeof f === 'string' ? f : f?.filename || f?.path || String(f)))
                    .map((f) => f.trim().replace(/^[`"']|[`"']$/g, ''))
                    .filter((f) => f.length > 0 && /\.(ts|tsx|js|jsx|py|json|md|css|html|rs|go|java|cpp|c|h|cs)$/i.test(f));
            }
        }
        catch {
            // Ignore JSON parse error, fall through to regex line-by-line parsing
        }
        const lines = text.split(/\r?\n/);
        const files = [];
        const codeFilePattern = /(?:[a-zA-Z0-9_\-./\\]+\.(?:ts|tsx|js|jsx|py|json|md|css|html|rs|go|java|cpp|c|h|cs))/gi;
        for (const line of lines) {
            // Strip leading bullet markers, numbered lists, backticks, and quotes without stripping internal hyphens
            const cleaned = line
                .replace(/^\s*[-*+]\s+/, '')
                .replace(/^\s*\d+\.\s+/, '')
                .replace(/[`"']/g, '')
                .trim();
            const matches = cleaned.match(codeFilePattern);
            if (matches) {
                for (const match of matches) {
                    const trimmed = match.replace(/^[./\\]+/, '').trim();
                    if (trimmed.includes('.') && !trimmed.startsWith('http')) {
                        files.push(trimmed);
                    }
                }
            }
        }
        return Array.from(new Set(files));
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