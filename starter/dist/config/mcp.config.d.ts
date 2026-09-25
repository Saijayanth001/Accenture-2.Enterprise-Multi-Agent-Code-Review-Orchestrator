/**
 * Model Context Protocol (MCP) server configurations
 *
 * Required MCP Servers:
 * 1. GitHub - For PR/repo operations
 * 2. ESLint - For code linting and style analysis
 *
 * Documentation:
 * - MCP Protocol: https://modelcontextprotocol.io
 * - GitHub MCP: https://github.com/github/github-mcp-server
 * - ESLint MCP: https://eslint.org/docs/latest/use/mcp
 */
export declare const mcpServersConfig: {
    /**
     * GitHub MCP Server
     * Provides tools for GitHub API operations
     *
     * Note: GITHUB_TOKEN is optional (recommended for private repos and higher rate limits).
     * The GitHub MCP server expects GITHUB_PERSONAL_ACCESS_TOKEN as the env var name.
     * We map our GITHUB_TOKEN from .env to this expected name.
     */
    github: {
        type: "stdio";
        command: string;
        args: string[];
        env: {
            GITHUB_PERSONAL_ACCESS_TOKEN: string;
        };
    };
    /**
     * ESLint MCP Server
     * Provides tools for linting and code quality analysis
     */
    eslint: {
        type: "stdio";
        command: string;
        args: string[];
        env: {};
    };
};
//# sourceMappingURL=mcp.config.d.ts.map