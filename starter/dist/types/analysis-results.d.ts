import { z } from 'zod';
/**
 * Structured output schemas for subagent analysis results
 * Uses Zod for runtime validation and converts to JSON Schema for SDK
 */
export declare const CodeQualityResultSchema: z.ZodObject<{
    file: z.ZodString;
    issues: z.ZodArray<z.ZodObject<{
        line: z.ZodNumber;
        severity: z.ZodEnum<["critical", "high", "medium", "low", "info"]>;
        category: z.ZodEnum<["security", "performance", "maintainability", "style", "bug-risk", "best-practice"]>;
        description: z.ZodString;
        suggestion: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        line: number;
        severity: "critical" | "high" | "medium" | "low" | "info";
        category: "security" | "performance" | "maintainability" | "style" | "bug-risk" | "best-practice";
        description: string;
        suggestion: string;
    }, {
        line: number;
        severity: "critical" | "high" | "medium" | "low" | "info";
        category: "security" | "performance" | "maintainability" | "style" | "bug-risk" | "best-practice";
        description: string;
        suggestion: string;
    }>, "many">;
    overallScore: z.ZodNumber;
    summary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    file: string;
    issues: {
        line: number;
        severity: "critical" | "high" | "medium" | "low" | "info";
        category: "security" | "performance" | "maintainability" | "style" | "bug-risk" | "best-practice";
        description: string;
        suggestion: string;
    }[];
    overallScore: number;
    summary: string;
}, {
    file: string;
    issues: {
        line: number;
        severity: "critical" | "high" | "medium" | "low" | "info";
        category: "security" | "performance" | "maintainability" | "style" | "bug-risk" | "best-practice";
        description: string;
        suggestion: string;
    }[];
    overallScore: number;
    summary: string;
}>;
export declare const TestCoverageResultSchema: z.ZodObject<{
    file: z.ZodString;
    hasTests: z.ZodBoolean;
    testFiles: z.ZodArray<z.ZodString, "many">;
    untestedPaths: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["function", "class", "branch", "edge-case"]>;
        location: z.ZodString;
        priority: z.ZodEnum<["critical", "high", "medium", "low"]>;
        reasoning: z.ZodString;
        suggestedTest: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "function" | "class" | "branch" | "edge-case";
        location: string;
        priority: "critical" | "high" | "medium" | "low";
        reasoning: string;
        suggestedTest: string;
    }, {
        type: "function" | "class" | "branch" | "edge-case";
        location: string;
        priority: "critical" | "high" | "medium" | "low";
        reasoning: string;
        suggestedTest: string;
    }>, "many">;
    coverageEstimate: z.ZodNumber;
    summary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    file: string;
    summary: string;
    hasTests: boolean;
    testFiles: string[];
    untestedPaths: {
        type: "function" | "class" | "branch" | "edge-case";
        location: string;
        priority: "critical" | "high" | "medium" | "low";
        reasoning: string;
        suggestedTest: string;
    }[];
    coverageEstimate: number;
}, {
    file: string;
    summary: string;
    hasTests: boolean;
    testFiles: string[];
    untestedPaths: {
        type: "function" | "class" | "branch" | "edge-case";
        location: string;
        priority: "critical" | "high" | "medium" | "low";
        reasoning: string;
        suggestedTest: string;
    }[];
    coverageEstimate: number;
}>;
export declare const RefactoringSuggestionSchema: z.ZodObject<{
    file: z.ZodString;
    suggestions: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["extract-function", "rename", "modernize", "simplify", "pattern-improvement"]>;
        location: z.ZodString;
        impact: z.ZodEnum<["low", "medium", "high"]>;
        description: z.ZodString;
        before: z.ZodString;
        after: z.ZodString;
        benefits: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: "extract-function" | "rename" | "modernize" | "simplify" | "pattern-improvement";
        description: string;
        location: string;
        impact: "high" | "medium" | "low";
        before: string;
        after: string;
        benefits: string;
    }, {
        type: "extract-function" | "rename" | "modernize" | "simplify" | "pattern-improvement";
        description: string;
        location: string;
        impact: "high" | "medium" | "low";
        before: string;
        after: string;
        benefits: string;
    }>, "many">;
    summary: z.ZodString;
}, "strip", z.ZodTypeAny, {
    file: string;
    summary: string;
    suggestions: {
        type: "extract-function" | "rename" | "modernize" | "simplify" | "pattern-improvement";
        description: string;
        location: string;
        impact: "high" | "medium" | "low";
        before: string;
        after: string;
        benefits: string;
    }[];
}, {
    file: string;
    summary: string;
    suggestions: {
        type: "extract-function" | "rename" | "modernize" | "simplify" | "pattern-improvement";
        description: string;
        location: string;
        impact: "high" | "medium" | "low";
        before: string;
        after: string;
        benefits: string;
    }[];
}>;
export type CodeQualityResult = z.infer<typeof CodeQualityResultSchema>;
export type TestCoverageResult = z.infer<typeof TestCoverageResultSchema>;
export type RefactoringSuggestion = z.infer<typeof RefactoringSuggestionSchema>;
type JsonSchema = Record<string, unknown>;
/**
 * Convert Zod schemas to JSON Schema for SDK structured outputs
 * Per SDK docs: https://platform.claude.com/docs/en/agent-sdk/structured-outputs
 * Use $refStrategy: 'root' to properly inline all $ref definitions
 */
export declare const CodeQualityResultJSONSchema: JsonSchema;
export declare const TestCoverageResultJSONSchema: JsonSchema;
export declare const RefactoringSuggestionJSONSchema: JsonSchema;
export {};
//# sourceMappingURL=analysis-results.d.ts.map