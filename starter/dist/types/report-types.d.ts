import { z } from 'zod';
/**
 * Complete Review Report Schema
 * Aggregates all subagent results into a unified report
 */
export declare const ReviewReportSchema: z.ZodObject<{
    pullRequest: z.ZodObject<{
        owner: z.ZodString;
        repo: z.ZodString;
        number: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        number: number;
        owner: string;
        repo: string;
    }, {
        number: number;
        owner: string;
        repo: string;
    }>;
    fileReviews: z.ZodArray<z.ZodObject<{
        file: z.ZodString;
        codeQuality: z.ZodObject<{
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
        testCoverage: z.ZodObject<{
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
        refactorings: z.ZodObject<{
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
    }, "strip", z.ZodTypeAny, {
        file: string;
        codeQuality: {
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
        };
        testCoverage: {
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
        };
        refactorings: {
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
        };
    }, {
        file: string;
        codeQuality: {
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
        };
        testCoverage: {
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
        };
        refactorings: {
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
        };
    }>, "many">;
    summary: z.ZodObject<{
        totalFiles: z.ZodNumber;
        overallScore: z.ZodNumber;
        criticalIssues: z.ZodNumber;
        highPriorityTests: z.ZodNumber;
        refactoringOpportunities: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        overallScore: number;
        totalFiles: number;
        criticalIssues: number;
        highPriorityTests: number;
        refactoringOpportunities: number;
    }, {
        overallScore: number;
        totalFiles: number;
        criticalIssues: number;
        highPriorityTests: number;
        refactoringOpportunities: number;
    }>;
    recommendations: z.ZodArray<z.ZodObject<{
        priority: z.ZodEnum<["critical", "high", "medium", "low"]>;
        category: z.ZodString;
        description: z.ZodString;
        files: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        category: string;
        description: string;
        priority: "critical" | "high" | "medium" | "low";
        files: string[];
    }, {
        category: string;
        description: string;
        priority: "critical" | "high" | "medium" | "low";
        files: string[];
    }>, "many">;
    metadata: z.ZodObject<{
        analyzedAt: z.ZodString;
        duration: z.ZodNumber;
        agentVersions: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        analyzedAt: string;
        duration: number;
        agentVersions: Record<string, string>;
    }, {
        analyzedAt: string;
        duration: number;
        agentVersions: Record<string, string>;
    }>;
}, "strip", z.ZodTypeAny, {
    summary: {
        overallScore: number;
        totalFiles: number;
        criticalIssues: number;
        highPriorityTests: number;
        refactoringOpportunities: number;
    };
    pullRequest: {
        number: number;
        owner: string;
        repo: string;
    };
    fileReviews: {
        file: string;
        codeQuality: {
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
        };
        testCoverage: {
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
        };
        refactorings: {
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
        };
    }[];
    recommendations: {
        category: string;
        description: string;
        priority: "critical" | "high" | "medium" | "low";
        files: string[];
    }[];
    metadata: {
        analyzedAt: string;
        duration: number;
        agentVersions: Record<string, string>;
    };
}, {
    summary: {
        overallScore: number;
        totalFiles: number;
        criticalIssues: number;
        highPriorityTests: number;
        refactoringOpportunities: number;
    };
    pullRequest: {
        number: number;
        owner: string;
        repo: string;
    };
    fileReviews: {
        file: string;
        codeQuality: {
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
        };
        testCoverage: {
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
        };
        refactorings: {
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
        };
    }[];
    recommendations: {
        category: string;
        description: string;
        priority: "critical" | "high" | "medium" | "low";
        files: string[];
    }[];
    metadata: {
        analyzedAt: string;
        duration: number;
        agentVersions: Record<string, string>;
    };
}>;
/**
 * TypeScript type inferred from Zod schema
 */
export type ReviewReport = z.infer<typeof ReviewReportSchema>;
type JsonSchema = Record<string, unknown>;
export declare const ReviewReportJSONSchema: JsonSchema;
export {};
//# sourceMappingURL=report-types.d.ts.map