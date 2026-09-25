import { query } from '@anthropic-ai/claude-agent-sdk';
import { CODE_QUALITY_ANALYZER_PROMPT } from '../prompts';
import {
  CodeQualityResultJSONSchema,
  CodeQualityResult,
  CodeQualityResultSchema
} from '../types/analysis-results';
import { mcpServersConfig } from '../config/mcp.config';

/**
 * Analyze a file for code quality issues
 */
export async function analyzeCodeQuality(
  filePath: string
): Promise<CodeQualityResult> {
  const model = process.env.ANTHROPIC_MODEL;
  const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();

  if (!model) {
    throw new Error('ANTHROPIC_MODEL environment variable is required');
  }

  const prompt = `${CODE_QUALITY_ANALYZER_PROMPT}

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
      allowedTools: ['Read', 'Skill', 'Grep', 'Glob', 'mcp__github__*'],
      outputFormat: {
        type: 'json_schema',
        schema: CodeQualityResultJSONSchema
      }
    }
  })) {
    if (message.type === 'result' && message.subtype === 'success' && message.structured_output) {
      const parsed = CodeQualityResultSchema.safeParse(message.structured_output);
      if (parsed.success) {
        return parsed.data;
      } else {
        throw new Error(`Schema validation failed: ${parsed.error.message}`);
      }
    }

    if (message.type === 'result' && message.subtype === 'error_max_structured_output_retries') {
      throw new Error('Structured output generation failed after maximum retries');
    }
  }

  throw new Error('Failed to get structured output from code quality analyzer');
}
