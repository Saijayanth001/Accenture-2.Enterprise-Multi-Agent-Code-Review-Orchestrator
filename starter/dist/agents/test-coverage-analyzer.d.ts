import { type AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { TestCoverageResult } from '../types/analysis-results';
/**
 * Subagent definition for Test Coverage Analyzer
 */
export declare const testCoverageAnalyzerAgent: AgentDefinition;
/**
 * Analyze a file for test coverage gaps
 */
export declare function analyzeTestCoverage(filePath: string): Promise<TestCoverageResult>;
//# sourceMappingURL=test-coverage-analyzer.d.ts.map