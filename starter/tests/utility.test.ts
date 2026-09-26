import { describe, it, expect, vi } from 'vitest';
import { RateLimiter } from '../src/utils/rate-limiter';
import { withRetry, withTimeout, ReviewError, ErrorCodes } from '../src/utils/error-handler';
import { ReportGenerator } from '../src/utils/report-generator';
import { ReviewReport } from '../src/types/report-types';

describe('Utility Modules', () => {
  describe('RateLimiter', () => {
    it('should initialize with custom configuration', () => {
      const limiter = new RateLimiter({
        maxRequestsPerMinute: 10,
        maxTokensPerMinute: 1000,
        maxConcurrent: 2
      });
      const status = limiter.getStatus();
      expect(status.maxConcurrent).toBe(2);
      expect(status.maxRequestsPerMinute).toBe(10);
      expect(status.maxTokensPerMinute).toBe(1000);
    });

    it('should acquire and release concurrency slots', async () => {
      const limiter = new RateLimiter({ maxConcurrent: 1 });
      await limiter.acquire(10);
      expect(limiter.getStatus().activeRequests).toBe(1);
      limiter.release();
      expect(limiter.getStatus().activeRequests).toBe(0);
    });
  });

  describe('Error Handler', () => {
    it('should throw ReviewError with proper error code', () => {
      const err = new ReviewError('API key missing', ErrorCodes.MISSING_API_KEY);
      expect(err.message).toBe('API key missing');
      expect(err.code).toBe(ErrorCodes.MISSING_API_KEY);
    });

    it('should retry failed operations and succeed', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 2) throw new Error('Temporary failure');
        return 'success';
      };

      const result = await withRetry(fn, 3, 10);
      expect(result).toBe('success');
      expect(attempts).toBe(2);
    });

    it('should timeout if operation takes too long', async () => {
      const slowFn = () => new Promise(resolve => setTimeout(resolve, 200));
      await expect(withTimeout(slowFn, 50, 'Timeout error')).rejects.toThrow('Timeout error');
    });
  });

  describe('ReportGenerator', () => {
    const sampleReport: ReviewReport = {
      pullRequest: { owner: 'facebook', repo: 'react', number: 12345 },
      fileReviews: [
        {
          file: 'src/main.ts',
          codeQuality: {
            file: 'src/main.ts',
            issues: [
              {
                line: 10,
                severity: 'critical',
                category: 'security',
                description: 'SQL Injection vulnerability',
                suggestion: 'Use parameterized queries'
              }
            ],
            overallScore: 70,
            summary: '1 critical security issue.'
          },
          testCoverage: {
            file: 'src/main.ts',
            hasTests: false,
            testFiles: [],
            untestedPaths: [
              {
                type: 'function',
                location: 'main() line 1',
                priority: 'critical',
                reasoning: 'No unit tests',
                suggestedTest: 'Add test for main()'
              }
            ],
            coverageEstimate: 0,
            summary: 'No test coverage.'
          },
          refactorings: {
            file: 'src/main.ts',
            suggestions: [
              {
                type: 'extract-function',
                location: 'lines 10-30',
                impact: 'high',
                description: 'Extract DB logic',
                before: 'rawQuery()',
                after: 'db.query()',
                benefits: 'Better security'
              }
            ],
            summary: '1 refactoring suggested.'
          }
        }
      ],
      summary: {
        totalFiles: 1,
        overallScore: 70,
        criticalIssues: 1,
        highPriorityTests: 1,
        refactoringOpportunities: 1
      },
      recommendations: [
        {
          priority: 'critical',
          category: 'Security',
          description: 'SQL Injection vulnerability',
          files: ['src/main.ts']
        }
      ],
      metadata: {
        analyzedAt: '2026-09-26T20:00:00.000Z',
        duration: 1234,
        agentVersions: {
          orchestrator: '1.0.0',
          codeQuality: '1.0.0',
          testCoverage: '1.0.0',
          refactoring: '1.0.0'
        }
      }
    };

    it('should generate valid Markdown report', () => {
      const generator = new ReportGenerator();
      const md = generator.generateMarkdownReport(sampleReport);
      expect(md).toContain('# 🔍 Code Review Report');
      expect(md).toContain('SQL Injection vulnerability');
      expect(md).toContain('src/main.ts');
    });

    it('should generate valid HTML report', () => {
      const generator = new ReportGenerator();
      const html = generator.generateHTMLReport(sampleReport);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Code Review Report');
      expect(html).toContain('SQL Injection vulnerability');
    });

    it('should generate valid JSON report', () => {
      const generator = new ReportGenerator();
      const jsonStr = generator.generateJSONReport(sampleReport);
      const parsed = JSON.parse(jsonStr);
      expect(parsed.pullRequest.owner).toBe('facebook');
      expect(parsed.summary.overallScore).toBe(70);
    });
  });
});
