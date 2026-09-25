import { ReviewReport } from '../types/report-types';
/**
 * Report Generator
 * Converts ReviewReport to various output formats (Markdown, HTML, JSON)
 */
export declare class ReportGenerator {
    /**
     * Generate a Markdown report for PR comments
     */
    generateMarkdownReport(report: ReviewReport): string;
    /**
     * Generate an HTML report for web display
     */
    generateHTMLReport(report: ReviewReport): string;
    /**
     * Generate formatted JSON report
     */
    generateJSONReport(report: ReviewReport): string;
}
//# sourceMappingURL=report-generator.d.ts.map