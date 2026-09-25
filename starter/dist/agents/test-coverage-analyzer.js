import { query } from '@anthropic-ai/claude-agent-sdk';
import { TEST_COVERAGE_ANALYZER_PROMPT } from '../prompts';
import { TestCoverageResultJSONSchema, TestCoverageResultSchema } from '../types/analysis-results';
import { mcpServersConfig } from '../config/mcp.config';
/**
 * Analyze a file for test coverage gaps
 */
export async function analyzeTestCoverage(filePath) {
    const model = process.env.ANTHROPIC_MODEL;
    const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();
    if (!model) {
        throw new Error('ANTHROPIC_MODEL environment variable is required');
    }
    const prompt = `${TEST_COVERAGE_ANALYZER_PROMPT}

File to analyze: ${filePath}

NOTE: If this is a GitHub PR file (indicated by "GitHub PR file from owner/repo: path"), use the GitHub MCP tools (mcp__github__*) to fetch the file content.`;
    for await (const message of query({
        prompt,
        options: {
            model,
            cwd: PROJECT_ROOT,
            settingSources: ['project'],
            mcpServers: {
                github: mcpServersConfig.github
            },
            allowedTools: ['Read', 'Grep', 'Glob', 'mcp__github__*'],
            // Note: Extended thinking is handled by the model automatically for complex analysis
            outputFormat: {
                type: 'json_schema',
                schema: TestCoverageResultJSONSchema
            }
        }
    })) {
        if (message.type === 'result' && message.subtype === 'success' && message.structured_output) {
            const parsed = TestCoverageResultSchema.safeParse(message.structured_output);
            if (parsed.success) {
                return parsed.data;
            }
            else {
                throw new Error(`Schema validation failed: ${parsed.error.message}`);
            }
        }
        if (message.type === 'result' && message.subtype === 'error_max_structured_output_retries') {
            throw new Error('Structured output generation failed after maximum retries');
        }
    }
    throw new Error('Failed to get structured output from test coverage analyzer');
}
//# sourceMappingURL=test-coverage-analyzer.js.map