import { codeQualityAnalyzerAgent } from './code-quality-analyzer';
import { testCoverageAnalyzerAgent } from './test-coverage-analyzer';
import { refactoringSuggesterAgent } from './refactoring-suggester';
export { codeQualityAnalyzerAgent, analyzeCodeQuality } from './code-quality-analyzer';
export { testCoverageAnalyzerAgent, analyzeTestCoverage } from './test-coverage-analyzer';
export { refactoringSuggesterAgent, suggestRefactorings } from './refactoring-suggester';
/**
 * Registry of subagents for the orchestrator query() configuration
 */
export const agentDefinitions = {
    'code-quality-analyzer': codeQualityAnalyzerAgent,
    'test-coverage-analyzer': testCoverageAnalyzerAgent,
    'refactoring-suggester': refactoringSuggesterAgent
};
/**
 * Export AgentDefinitions for compatibility with requirement specifications
 */
export const AgentDefinitions = agentDefinitions;
//# sourceMappingURL=index.js.map