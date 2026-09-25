import winston from 'winston';
/**
 * Application logger using Winston
 * Outputs to console and log files with structured JSON format
 */
export declare const logger: winston.Logger;
/**
 * Log helper functions for common operations
 */
export declare const logReviewStart: (owner: string, repo: string, prNumber: number) => void;
export declare const logReviewComplete: (owner: string, repo: string, prNumber: number, score: number, duration: number) => void;
export declare const logReviewError: (owner: string, repo: string, prNumber: number, error: Error) => void;
export declare const logAgentStart: (agentName: string, file: string) => void;
export declare const logAgentComplete: (agentName: string, file: string, duration: number) => void;
//# sourceMappingURL=logger.d.ts.map