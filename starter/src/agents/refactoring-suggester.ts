import { query, type AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { REFACTORING_SUGGESTER_PROMPT } from '../prompts';
import {
  RefactoringSuggestionJSONSchema,
  RefactoringSuggestion,
  RefactoringSuggestionSchema
} from '../types/analysis-results';
import { mcpServersConfig } from '../config/mcp.config';

/**
 * Subagent definition for Refactoring Suggester
 */
export const refactoringSuggesterAgent: AgentDefinition = {
  description: 'Specialized subagent for recommending architectural improvements, pattern applications, and refactoring opportunities.',
  prompt: REFACTORING_SUGGESTER_PROMPT,
  tools: ['Read', 'Skill', 'Grep', 'Glob', 'mcp__github__*'],
  model: 'inherit'
};

/**
 * Suggest refactorings for a file
 */
export async function suggestRefactorings(
  filePath: string
): Promise<RefactoringSuggestion> {
  const model = process.env.ANTHROPIC_MODEL;
  const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();

  if (!model) {
    throw new Error('ANTHROPIC_MODEL environment variable is required');
  }

  const prompt = `${REFACTORING_SUGGESTER_PROMPT}

File to analyze: ${filePath}

NOTE: If this is a GitHub PR file (indicated by "GitHub PR file from owner/repo: path"), use the GitHub MCP tools (mcp__github__*) or Read tool to fetch the file content.`;

  for await (const message of query({
    prompt,
    options: {
      model,
      cwd: PROJECT_ROOT,
      settingSources: ['project'],
      agents: {
        'refactoring-suggester': refactoringSuggesterAgent
      },
      mcpServers: {
        github: mcpServersConfig.github
      },
      allowedTools: ['Task', 'Read', 'Skill', 'Grep', 'Glob', 'mcp__github__*'],
      outputFormat: {
        type: 'json_schema',
        schema: RefactoringSuggestionJSONSchema
      }
    }
  })) {
    if (message.type === 'result' && message.subtype === 'success' && message.structured_output) {
      const parsed = RefactoringSuggestionSchema.safeParse(message.structured_output);
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

  throw new Error('Failed to get structured output from refactoring suggester');
}
