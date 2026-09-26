import { type AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { RefactoringSuggestion } from '../types/analysis-results';
/**
 * Subagent definition for Refactoring Suggester
 */
export declare const refactoringSuggesterAgent: AgentDefinition;
/**
 * Suggest refactorings for a file
 */
export declare function suggestRefactorings(filePath: string): Promise<RefactoringSuggestion>;
//# sourceMappingURL=refactoring-suggester.d.ts.map