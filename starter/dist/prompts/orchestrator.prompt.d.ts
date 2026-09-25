/**
 * Orchestrator Prompt Builder
 * Generates the main prompt for the orchestrator agent
 */
interface PRInfo {
    owner: string;
    repo: string;
    number: number;
}
/**
 * Build the orchestrator prompt for analyzing a pull request
 */
export declare function buildOrchestratorPrompt(prInfo: PRInfo): string;
export {};
//# sourceMappingURL=orchestrator.prompt.d.ts.map