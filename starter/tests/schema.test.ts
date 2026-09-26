import { describe, it, expect } from 'vitest';
import {
  CodeQualityResultSchema,
  TestCoverageResultSchema,
  RefactoringSuggestionSchema,
  CodeQualityResultJSONSchema,
  TestCoverageResultJSONSchema,
  RefactoringSuggestionJSONSchema
} from '../src/types/analysis-results';

describe('Zod & JSON Schemas', () => {
  describe('CodeQualityResultSchema', () => {
    it('should validate a valid CodeQualityResult object', () => {
      const validData = {
        file: 'src/main.ts',
        issues: [
          {
            line: 42,
            severity: 'high',
            category: 'security',
            description: 'Hardcoded API key detected',
            suggestion: 'Use environment variables instead'
          }
        ],
        overallScore: 85,
        summary: 'Good overall quality with 1 security warning.'
      };

      const result = CodeQualityResultSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid severity or score out of bounds', () => {
      const invalidData = {
        file: 'src/main.ts',
        issues: [
          {
            line: 1,
            severity: 'super-critical', // Invalid enum
            category: 'security',
            description: 'Issue',
            suggestion: 'Fix'
          }
        ],
        overallScore: 150, // Invalid range (>100)
        summary: 'Invalid'
      };

      const result = CodeQualityResultSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should export a valid JSON schema object', () => {
      expect(CodeQualityResultJSONSchema).toBeDefined();
      expect(typeof CodeQualityResultJSONSchema).toBe('object');
    });
  });

  describe('TestCoverageResultSchema', () => {
    it('should validate a valid TestCoverageResult object', () => {
      const validData = {
        file: 'src/utils/calculator.ts',
        hasTests: true,
        testFiles: ['tests/calculator.test.ts'],
        untestedPaths: [
          {
            type: 'branch',
            location: 'divide() line 12',
            priority: 'high',
            reasoning: 'Division by zero is not tested',
            suggestedTest: 'expect(() => divide(5, 0)).toThrow()'
          }
        ],
        coverageEstimate: 90,
        summary: 'High coverage, minor edge case missing.'
      };

      const result = TestCoverageResultSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should export a valid JSON schema object', () => {
      expect(TestCoverageResultJSONSchema).toBeDefined();
      expect(typeof TestCoverageResultJSONSchema).toBe('object');
    });
  });

  describe('RefactoringSuggestionSchema', () => {
    it('should validate a valid RefactoringSuggestion object', () => {
      const validData = {
        file: 'src/orchestrator.ts',
        suggestions: [
          {
            type: 'extract-function',
            location: 'reviewPullRequest() lines 50-100',
            impact: 'medium',
            description: 'Extract report calculation into separate method',
            before: '// long code',
            after: 'this.calculateSummary(fileReviews)',
            benefits: 'Improves readability and modularity'
          }
        ],
        summary: '1 refactoring opportunity found.'
      };

      const result = RefactoringSuggestionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should export a valid JSON schema object', () => {
      expect(RefactoringSuggestionJSONSchema).toBeDefined();
      expect(typeof RefactoringSuggestionJSONSchema).toBe('object');
    });
  });
});
