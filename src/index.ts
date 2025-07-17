#!/usr/bin/env node
/**
 * Grafana UI MCP Server
 *
 * A Model Context Protocol server for Grafana UI components.
 * Provides AI assistants with access to component source code, documentation, stories, and metadata.
 *
 * Usage:
 *   npx @jpisnice/grafana-ui-mcp-server
 *   npx @jpisnice/grafana-ui-mcp-server --github-api-key YOUR_TOKEN
 *   npx @jpisnice/grafana-ui-mcp-server -g YOUR_TOKEN
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupHandlers } from "./handler.js";
import { axios } from "./utils/axios.js";

/**
 * Parse command line arguments
 */
async function parseArgs() {
  const args = process.argv.slice(2);

  // Help flag
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Grafana UI MCP Server v1.0.0

A Model Context Protocol server for Grafana UI components, providing AI assistants
with comprehensive access to component source code, documentation, stories, and metadata.

Usage:
  npx @shelldandy/grafana-ui-mcp-server [options]

Options:
  --github-api-key, -g <token>     GitHub Personal Access Token for API access
  --grafana-repo-path, -l <path>   Path to local Grafana repository (takes precedence over GitHub API)
  --help, -h                       Show this help message
  --version, -v                    Show version information

Examples:
  npx @shelldandy/grafana-ui-mcp-server
  npx @shelldandy/grafana-ui-mcp-server --github-api-key ghp_your_token_here
  npx @shelldandy/grafana-ui-mcp-server -g ghp_your_token_here
  npx @shelldandy/grafana-ui-mcp-server --grafana-repo-path /path/to/grafana
  npx @shelldandy/grafana-ui-mcp-server -l /path/to/grafana

Environment Variables:
  GITHUB_PERSONAL_ACCESS_TOKEN     Alternative way to provide GitHub token
  GITHUB_TOKEN                     Alternative way to provide GitHub token
  GRAFANA_REPO_PATH               Path to local Grafana repository

Available Tool (Unified Interface):
  Single Tool: grafana_ui
    • Action-based routing with 11 available actions
    • Comprehensive parameter validation
    • Simplified interface for AI agents
    
  Core Actions:
    • get_component     - Get component source code
    • get_demo          - Get Storybook demo/usage examples
    • list_components   - List all available components
    • get_metadata      - Get component metadata and props
    • get_directory     - Browse repository structure
    
  Advanced Actions:
    • get_documentation - Get rich MDX documentation
    • get_stories       - Get parsed Storybook stories
    • get_tests         - Get test files and usage patterns
    • search            - Search components by name/description
    • get_theme_tokens  - Get Grafana design system tokens
    • get_dependencies  - Get dependency tree analysis
    
  Usage: { "tool": "grafana_ui", "arguments": { "action": "get_component", "componentName": "Button" } }

GitHub API Setup:
  Without token: 60 requests/hour (rate limited)
  With token:    5,000 requests/hour (recommended)
  
  Get your free token at: https://github.com/settings/tokens
  Select 'public_repo' scope for optimal performance.

For more information, visit: https://github.com/shelldandy/grafana-ui-mcp-server
`);
    process.exit(0);
  }

  // Version flag
  if (args.includes("--version") || args.includes("-v")) {
    // Read version from package.json
    try {
      const fs = await import("fs");
      const path = await import("path");
      const { fileURLToPath } = await import("url");

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const packagePath = path.join(__dirname, "..", "package.json");

      const packageContent = fs.readFileSync(packagePath, "utf8");
      const packageJson = JSON.parse(packageContent);
      console.log(`Grafana UI MCP Server v${packageJson.version}`);
    } catch (error) {
      console.log("Grafana UI MCP Server v1.0.0");
    }
    process.exit(0);
  }

  // GitHub API key
  const githubApiKeyIndex = args.findIndex(
    (arg) => arg === "--github-api-key" || arg === "-g",
  );
  let githubApiKey = null;

  if (githubApiKeyIndex !== -1 && args[githubApiKeyIndex + 1]) {
    githubApiKey = args[githubApiKeyIndex + 1];
  } else if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
    githubApiKey = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  } else if (process.env.GITHUB_TOKEN) {
    githubApiKey = process.env.GITHUB_TOKEN;
  }

  // Grafana repository path
  const grafanaRepoPathIndex = args.findIndex(
    (arg) => arg === "--grafana-repo-path" || arg === "-l",
  );
  let grafanaRepoPath = null;

  if (grafanaRepoPathIndex !== -1 && args[grafanaRepoPathIndex + 1]) {
    grafanaRepoPath = args[grafanaRepoPathIndex + 1];
  } else if (process.env.GRAFANA_REPO_PATH) {
    grafanaRepoPath = process.env.GRAFANA_REPO_PATH;
  }

  return { githubApiKey, grafanaRepoPath };
}

/**
 * Main function to start the MCP server
 */
async function main() {
  try {
    const { githubApiKey, grafanaRepoPath } = await parseArgs();

    // Configure local Grafana repository path (takes precedence over GitHub API)
    if (grafanaRepoPath) {
      try {
        axios.setLocalGrafanaRepo(grafanaRepoPath);
        console.error(`Local Grafana repository configured: ${grafanaRepoPath}`);
      } catch (error: any) {
        console.error(`Error configuring local repository: ${error.message}`);
        console.error("Falling back to GitHub API access");
        
        // Fall back to GitHub API configuration
        if (githubApiKey) {
          axios.setGitHubApiKey(githubApiKey);
          console.error("GitHub API key configured successfully");
        }
      }
    } else if (githubApiKey) {
      axios.setGitHubApiKey(githubApiKey);
      console.error("GitHub API key configured successfully");
    } else {
      console.error(
        "Warning: No local repository or GitHub API key provided. Rate limited to 60 requests/hour.",
      );
      console.error(
        "Use --grafana-repo-path for local access or --github-api-key for GitHub API access.",
      );
    }

    // Initialize the MCP server with metadata and capabilities
    const server = new Server(
      {
        name: "grafana-ui-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {}, // Will be filled with registered resources
          prompts: {}, // Will be filled with registered prompts
          tools: {}, // Will be filled with registered tools
        },
      },
    );

    // Set up request handlers and register components (tools, resources, etc.)
    setupHandlers(server);

    // Start server using stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Grafana UI MCP Server started successfully");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
