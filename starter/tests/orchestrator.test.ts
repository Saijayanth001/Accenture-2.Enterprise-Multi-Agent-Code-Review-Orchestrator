import { describe, it, expect, vi } from 'vitest';
import { CodeReviewOrchestrator } from '../src/orchestrator';
import { agentDefinitions, AgentDefinitions } from '../src/agents';

describe('CodeReviewOrchestrator', () => {
  describe('Subagent Definitions', () => {
    it('should export agentDefinitions with code-quality-analyzer, test-coverage-analyzer, refactoring-suggester', () => {
      expect(agentDefinitions).toBeDefined();
      expect(agentDefinitions['code-quality-analyzer']).toBeDefined();
      expect(agentDefinitions['test-coverage-analyzer']).toBeDefined();
      expect(agentDefinitions['refactoring-suggester']).toBeDefined();
      expect(AgentDefinitions).toEqual(agentDefinitions);
    });

    it('should configure all 3 subagents with model inherit and Skill tool', () => {
      const agents = [
        agentDefinitions['code-quality-analyzer'],
        agentDefinitions['test-coverage-analyzer'],
        agentDefinitions['refactoring-suggester']
      ];

      for (const agent of agents) {
        expect(agent.description).toBeTruthy();
        expect(agent.model).toBe('inherit');
        expect(agent.tools).toContain('Skill');
      }
    });
  });

  describe('Configuration', () => {
    it('should initialize with default options', () => {
      const orchestrator = new CodeReviewOrchestrator();
      expect(orchestrator).toBeDefined();
    });

    it('should accept custom rate limit configuration', () => {
      const orchestrator = new CodeReviewOrchestrator({
        rateLimits: {
          maxRequestsPerMinute: 20,
          maxConcurrent: 2
        },
        timeout: 10000,
        maxRetries: 2
      });
      expect(orchestrator).toBeDefined();
    });
  });

  describe('extractFileList', () => {
    const orchestrator = new CodeReviewOrchestrator();

    it('should extract files from JSON array strings', () => {
      const input = '["src/index.ts", "src/utils/logger.ts"]';
      const result = orchestrator.extractFileList(input);
      expect(result).toEqual(['src/index.ts', 'src/utils/logger.ts']);
    });

    it('should extract files from markdown bullet lists with backticks', () => {
      const input = `
Here are the changed files:
- \`src/main.ts\`
- \`src/agents/code-quality-analyzer.ts\`
* \`packages/core/index.js\`
      `;
      const result = orchestrator.extractFileList(input);
      expect(result).toContain('src/main.ts');
      expect(result).toContain('src/agents/code-quality-analyzer.ts');
      expect(result).toContain('packages/core/index.js');
    });

    it('should extract files from numbered text lists', () => {
      const input = `
1. src/app.ts
2. lib/helpers.py
      `;
      const result = orchestrator.extractFileList(input);
      expect(result).toEqual(['src/app.ts', 'lib/helpers.py']);
    });
  });

  describe('Summary & Recommendations Calculation', () => {
    const orchestrator = new CodeReviewOrchestrator();
    const sampleReviews = [
      {
        file: 'src/auth.ts',
        codeQuality: {
          file: 'src/auth.ts',
          issues: [
            {
              line: 15,
              severity: 'critical' as const,
              category: 'security' as const,
              description: 'Hardcoded secret key',
              suggestion: 'Use process.env'
            }
          ],
          overallScore: 60,
          summary: 'Critical security flaw.'
        },
        testCoverage: {
          file: 'src/auth.ts',
          hasTests: false,
          testFiles: [],
          untestedPaths: [
            {
              type: 'function' as const,
              location: 'login() line 1',
              priority: 'critical' as const,
              reasoning: 'Authentication logic untested',
              suggestedTest: 'Add unit test for login()'
            }
          ],
          coverageEstimate: 10,
          summary: 'Low coverage.'
        },
        refactorings: {
          file: 'src/auth.ts',
          suggestions: [
            {
              type: 'extract-function' as const,
              location: 'login()',
              impact: 'high' as const,
              description: 'Extract token verification',
              before: 'jwt.verify()',
              after: 'verifyToken()',
              benefits: 'Modularity'
            }
          ],
          summary: '1 refactoring.'
        }
      }
    ];

    it('should calculate correct summary stats', () => {
      const summary = orchestrator.calculateSummary(sampleReviews);
      expect(summary.totalFiles).toBe(1);
      expect(summary.overallScore).toBe(60);
      expect(summary.criticalIssues).toBe(1);
      expect(summary.highPriorityTests).toBe(1);
      expect(summary.refactoringOpportunities).toBe(1);
    });

    it('should generate top recommendations correctly', () => {
      const recs = orchestrator.generateRecommendations(sampleReviews);
      expect(recs.length).toBeGreaterThan(0);
      expect(recs[0].category).toBe('Security');
      expect(recs[0].priority).toBe('critical');
      expect(recs[0].files).toContain('src/auth.ts');
    });
  });
});
