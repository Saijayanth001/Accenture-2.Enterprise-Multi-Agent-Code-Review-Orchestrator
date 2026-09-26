import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

/**
 * Main entry point for the Claude Multi-Agent Code Review System
 * Usage: npm run dev <owner> <repo> <pr-number>
 */
async function main() {
  const [owner, repo, prStr] = process.argv.slice(2);

  // Validate command line arguments
  if (!owner || !repo || !prStr) {
    console.error('❌ Error: Missing required arguments');
    console.error('');
    console.error('Usage: npm run dev <owner> <repo> <pr-number>');
    console.error('Example: npm run dev facebook react 12345');
    console.error('');
    process.exit(1);
  }

  const prNumber = parseInt(prStr, 10);
  if (isNaN(prNumber) || prNumber <= 0) {
    console.error('❌ Error: PR number must be a positive integer');
    console.error(`Received: ${prStr}`);
    console.error('');
    process.exit(1);
  }

  // Validate authentication (choose ONE method)
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
  const hasAWSCredentials = !!process.env.AWS_ACCESS_KEY_ID && !!process.env.AWS_SECRET_ACCESS_KEY;

  if (!hasAnthropicKey && !hasAWSCredentials) {
    console.error('❌ Error: No authentication configured');
    console.error('');
    console.error('You must configure ONE of the following authentication methods:');
    console.error('');
    console.error('Option 1 - Anthropic API (Recommended):');
    console.error('  Add to .env file:');
    console.error('  ANTHROPIC_API_KEY=sk-ant-your-key-here');
    console.error('');
    console.error('Option 2 - AWS Bedrock:');
    console.error('  Add to .env file:');
    console.error('  AWS_ACCESS_KEY_ID=your-access-key');
    console.error('  AWS_SECRET_ACCESS_KEY=your-secret-key');
    console.error('  AWS_REGION=us-east-1');
    console.error('');
    process.exit(1);
  }

  // Log authentication method
  if (hasAWSCredentials) {
    if (!process.env.AWS_REGION) {
      console.error('❌ Error: AWS_REGION is required when using AWS Bedrock');
      console.error('Add to .env file: AWS_REGION=us-east-1');
      console.error('');
      process.exit(1);
    }
    console.log('🔐 Using AWS Bedrock authentication');
  } else {
    console.log('🔐 Using Anthropic API authentication');
  }

  // Validate ANTHROPIC_MODEL environment variable
  if (!process.env.ANTHROPIC_MODEL) {
    console.error('❌ Error: ANTHROPIC_MODEL environment variable is required');
    console.error('');
    console.error('Add to .env file:');
    console.error('  For Anthropic API: ANTHROPIC_MODEL=claude-sonnet-4-5-20250929');
    console.error('  For AWS Bedrock: ANTHROPIC_MODEL=us.anthropic.claude-sonnet-4-5-20250929-v1:0');
    console.error('');
    process.exit(1);
  }

  console.log(`📊 Starting code review for ${owner}/${repo} PR #${prNumber}`);
  console.log('');

  try {
    // Create orchestrator instance
    const orchestrator = new CodeReviewOrchestrator({
      rateLimits: {
        maxRequestsPerMinute: 50,
        maxTokensPerMinute: 100000,
        maxConcurrent: 5
      },
      timeout: 300000, // 5 minutes
      maxRetries: 3
    });

    // Run code review
    logger.info('Starting code review', { owner, repo, prNumber });
    const report = await orchestrator.reviewPullRequest(owner, repo, prNumber);

    // Ensure reports directory exists
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate reports
    const reportGenerator = new ReportGenerator();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = `${owner}-${repo}-pr${prNumber}-${timestamp}`;

    // Generate and save Markdown report
    const markdownReport = reportGenerator.generateMarkdownReport(report);
    const markdownPath = path.join(reportsDir, `${baseFilename}.md`);
    fs.writeFileSync(markdownPath, markdownReport, 'utf-8');
    console.log(`✅ Markdown report saved: ${markdownPath}`);

    // Generate and save HTML report
    const htmlReport = reportGenerator.generateHTMLReport(report);
    const htmlPath = path.join(reportsDir, `${baseFilename}.html`);
    fs.writeFileSync(htmlPath, htmlReport, 'utf-8');
    console.log(`✅ HTML report saved: ${htmlPath}`);

    // Generate and save JSON report
    const jsonReport = reportGenerator.generateJSONReport(report);
    const jsonPath = path.join(reportsDir, `${baseFilename}.json`);
    fs.writeFileSync(jsonPath, jsonReport, 'utf-8');
    console.log(`✅ JSON report saved: ${jsonPath}`);

    console.log('');
    console.log('📈 Review Summary:');
    console.log(`  Overall Score: ${report.summary.overallScore}/100`);
    console.log(`  Files Reviewed: ${report.summary.totalFiles}`);
    console.log(`  Critical Issues: ${report.summary.criticalIssues}`);
    console.log(`  High Priority Tests: ${report.summary.highPriorityTests}`);
    console.log(`  Refactoring Opportunities: ${report.summary.refactoringOpportunities}`);
    console.log('');

    logger.info('Code review completed successfully', {
      owner,
      repo,
      prNumber,
      overallScore: report.summary.overallScore
    });

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Code review failed');
    console.error('');
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      logger.error('Code review failed', { error: error.message, stack: error.stack });
    } else {
      console.error('Unknown error occurred');
      logger.error('Code review failed', { error: String(error) });
    }
    console.error('');
    process.exit(1);
  }
}

main();
