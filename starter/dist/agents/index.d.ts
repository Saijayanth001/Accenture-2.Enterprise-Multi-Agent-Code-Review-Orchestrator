import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
export { codeQualityAnalyzerAgent, analyzeCodeQuality } from './code-quality-analyzer';
export { testCoverageAnalyzerAgent, analyzeTestCoverage } from './test-coverage-analyzer';
export { refactoringSuggesterAgent, suggestRefactorings } from './refactoring-suggester';
/**
 * Registry of subagents for the orchestrator query() configuration
 */
export declare const agentDefinitions: Record<string, AgentDefinition>;
/**
 * Export AgentDefinitions for compatibility with requirement specifications
 */
export declare const AgentDefinitions: Record<string, AgentDefinition>;
//# sourceMappingURL=index.d.ts.map