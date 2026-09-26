import { type AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { CodeQualityResult } from '../types/analysis-results';
/**
 * Subagent definition for Code Quality Analyzer
 */
export declare const codeQualityAnalyzerAgent: AgentDefinition;
/**
 * Analyze a file for code quality issues
 */
export declare function analyzeCodeQuality(filePath: string): Promise<CodeQualityResult>;
//# sourceMappingURL=code-quality-analyzer.d.ts.map