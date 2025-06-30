/**
 * Tools implementation for the Model Context Protocol (MCP) server.
 *
 * This file defines the tools that can be called by the AI model through the MCP protocol.
 * Each tool has a schema that defines its parameters and a handler function that implements its logic.
 *
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { axios } from "./utils/axios.js";
import { parseMDXContent } from "./utils/mdx-parser.js";
import {
  parseStoryMetadata,
  extractStoryExamples,
} from "./utils/story-parser.js";
import {
  extractThemeTokens,
  extractThemeMetadata,
  filterTokensByCategory,
} from "./utils/theme-extractor.js";
import { z } from "zod";

/**
 * Creates a standardized success response
 * @param data Data to include in the response
 * @returns Formatted response object
 */
function createSuccessResponse(data: any) {
  return {
    content: [
      {
        type: "text",
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Creates a standardized error response
 * @param message Error message
 * @param code Error code
 * @returns Formatted error response
 */
function createErrorResponse(
  message: string,
  code: ErrorCode = ErrorCode.InternalError,
) {
  throw new McpError(code, message);
}

/**
 * Define an MCP server for our tools
 */
export const server = new McpServer({
  name: "GrafanaUI Tools",
  version: "1.0.0",
});

// Tool: get_component - Fetch component source code
server.tool(
  "get_component",
  "Get the source code for a specific Grafana UI component",
  {
    componentName: z
      .string()
      .describe('Name of the Grafana UI component (e.g., "Button", "Alert")'),
  },
  async ({ componentName }) => {
    try {
      const sourceCode = await axios.getComponentSource(componentName);
      return {
        content: [{ type: "text", text: sourceCode }],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get component "${componentName}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Tool: get_component_demo - Fetch component demo/example
server.tool(
  "get_component_demo",
  "Get Storybook stories showing how a Grafana UI component should be used",
  {
    componentName: z
      .string()
      .describe('Name of the Grafana UI component (e.g., "Button", "Alert")'),
  },
  async ({ componentName }) => {
    try {
      const demoCode = await axios.getComponentDemo(componentName);
      return {
        content: [{ type: "text", text: demoCode }],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get demo for component "${componentName}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Tool: list_components - Get all available components
server.tool(
  "list_components",
  "Get all available Grafana UI components",
  {},
  async () => {
    try {
      const components = await axios.getAvailableComponents();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                components: components.sort(),
                total: components.length,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list components: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Tool: get_component_metadata - Get component metadata
server.tool(
  "get_component_metadata",
  "Get metadata for a specific Grafana UI component",
  {
    componentName: z
      .string()
      .describe('Name of the Grafana UI component (e.g., "Button", "Alert")'),
  },
  async ({ componentName }) => {
    try {
      const metadata = await axios.getComponentMetadata(componentName);
      if (!metadata) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          `Metadata not found for component "${componentName}"`,
        );
      }

      return {
        content: [{ type: "text", text: JSON.stringify(metadata, null, 2) }],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get metadata for component "${componentName}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Tool: get_directory_structure - Get repository directory structure
server.tool(
  "get_directory_structure",
  "Get the directory structure of the Grafana UI components",
  {
    path: z
      .string()
      .optional()
      .describe("Path within the repository (default: components directory)"),
    owner: z
      .string()
      .optional()
      .describe('Repository owner (default: "grafana")'),
    repo: z
      .string()
      .optional()
      .describe('Repository name (default: "grafana")'),
    branch: z.string().optional().describe('Branch name (default: "main")'),
  },
  async ({ path, owner, repo, branch }) => {
    try {
      const directoryTree = await axios.buildDirectoryTree(
        owner || axios.paths.REPO_OWNER,
        repo || axios.paths.REPO_NAME,
        path || axios.paths.COMPONENTS_PATH,
        branch || axios.paths.REPO_BRANCH,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(directoryTree, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get directory structure: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Tool: get_component_documentation - Get MDX documentation for a component
server.tool(
  "get_component_documentation",
  "Get rich MDX documentation for a specific Grafana UI component",
  {
    componentName: z
      .string()
      .describe('Name of the Grafana UI component (e.g., "Button", "Alert")'),
  },
  async ({ componentName }) => {
    try {
      const mdxContent = await axios.getComponentDocumentation(componentName);
      const parsedContent = parseMDXContent(componentName, mdxContent);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                title: parsedContent.title,
                sections: parsedContent.sections.map((section) => ({
                  title: section.title,
                  level: section.level,
                  content:
                    section.content.substring(0, 500) +
                    (section.content.length > 500 ? "..." : ""),
                  examples: section.examples.length,
                })),
                totalExamples: parsedContent.examples.length,
                imports: parsedContent.imports,
                components: parsedContent.components,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get documentation for component "${componentName}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Tool: get_component_stories - Get Storybook stories for a component
server.tool(
  "get_component_stories",
  "Get parsed Storybook stories with interactive examples for a Grafana UI component",
  {
    componentName: z
      .string()
      .describe('Name of the Grafana UI component (e.g., "Button", "Alert")'),
  },
  async ({ componentName }) => {
    try {
      const storyContent = await axios.getComponentDemo(componentName);
      const storyMetadata = parseStoryMetadata(componentName, storyContent);
      const examples = extractStoryExamples(storyContent);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                component: storyMetadata.componentName,
                meta: storyMetadata.meta,
                totalStories: storyMetadata.totalStories,
                hasInteractiveStories: storyMetadata.hasInteractiveStories,
                examples: examples.slice(0, 5), // Limit examples for response size
                rawStoryCode:
                  storyContent.substring(0, 1000) +
                  (storyContent.length > 1000 ? "..." : ""),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get stories for component "${componentName}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Tool: get_component_tests - Get test files for a component
server.tool(
  "get_component_tests",
  "Get test files showing usage patterns for a Grafana UI component",
  {
    componentName: z
      .string()
      .describe('Name of the Grafana UI component (e.g., "Button", "Alert")'),
  },
  async ({ componentName }) => {
    try {
      const testContent = await axios.getComponentTests(componentName);

      // Extract test patterns and usage examples
      const testDescriptions = [];
      const testRegex = /(describe|it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g;
      let match;

      while ((match = testRegex.exec(testContent)) !== null) {
        testDescriptions.push({
          type: match[1],
          description: match[2],
        });
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                component: componentName,
                testDescriptions: testDescriptions.slice(0, 10),
                totalTests: testDescriptions.filter(
                  (t) => t.type === "it" || t.type === "test",
                ).length,
                testCode:
                  testContent.substring(0, 2000) +
                  (testContent.length > 2000 ? "..." : ""),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get tests for component "${componentName}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Tool: search_components - Search components by name and description
server.tool(
  "search_components",
  "Search Grafana UI components by name and optionally by documentation content",
  {
    query: z.string().describe("Search query string"),
    includeDescription: z
      .boolean()
      .optional()
      .describe("Whether to search in documentation content (default: false)"),
  },
  async ({ query, includeDescription = false }) => {
    try {
      const searchResults = await axios.searchComponents(
        query,
        includeDescription,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                query,
                includeDescription,
                results: searchResults,
                totalResults: searchResults.length,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to search components with query "${query}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Tool: get_theme_tokens - Get Grafana design system tokens
server.tool(
  "get_theme_tokens",
  "Get Grafana design system tokens and theme information",
  {
    category: z
      .string()
      .optional()
      .describe(
        "Token category to filter by (colors, typography, spacing, shadows, etc.)",
      ),
  },
  async ({ category }) => {
    try {
      const themeFiles = await axios.getThemeFiles(category);

      const processedThemes: any = {};

      for (const [themeName, themeContent] of Object.entries(
        themeFiles.themes,
      )) {
        if (typeof themeContent === "string") {
          const tokens = extractThemeTokens(themeContent);
          const metadata = extractThemeMetadata(themeContent);

          processedThemes[themeName] = {
            metadata,
            tokens: category
              ? filterTokensByCategory(tokens, category)
              : tokens,
          };
        }
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                category: category || "all",
                themes: processedThemes,
                availableThemes: Object.keys(processedThemes),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get theme tokens${category ? ` for category "${category}"` : ""}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Tool: get_component_dependencies - Get component dependency analysis
server.tool(
  "get_component_dependencies",
  "Get dependency tree analysis for a Grafana UI component",
  {
    componentName: z
      .string()
      .describe('Name of the Grafana UI component (e.g., "Button", "Alert")'),
    deep: z
      .boolean()
      .optional()
      .describe("Whether to analyze dependencies recursively (default: false)"),
  },
  async ({ componentName, deep = false }) => {
    try {
      const dependencies = await axios.getComponentDependencies(
        componentName,
        deep,
      );

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(dependencies, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to analyze dependencies for component "${componentName}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Export tools for backward compatibility
export const tools = {
  get_component: {
    name: "get_component",
    description: "Get the source code for a specific Grafana UI component",
    inputSchema: {
      type: "object",
      properties: {
        componentName: {
          type: "string",
          description:
            'Name of the Grafana UI component (e.g., "Button", "Alert")',
        },
      },
      required: ["componentName"],
    },
  },
  get_component_demo: {
    name: "get_component_demo",
    description:
      "Get Storybook stories showing how a Grafana UI component should be used",
    inputSchema: {
      type: "object",
      properties: {
        componentName: {
          type: "string",
          description:
            'Name of the Grafana UI component (e.g., "Button", "Alert")',
        },
      },
      required: ["componentName"],
    },
  },
  list_components: {
    name: "list_components",
    description: "Get all available Grafana UI components",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  get_component_metadata: {
    name: "get_component_metadata",
    description: "Get metadata for a specific Grafana UI component",
    inputSchema: {
      type: "object",
      properties: {
        componentName: {
          type: "string",
          description:
            'Name of the Grafana UI component (e.g., "Button", "Alert")',
        },
      },
      required: ["componentName"],
    },
  },
  get_directory_structure: {
    name: "get_directory_structure",
    description: "Get the directory structure of the Grafana UI components",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            "Path within the repository (default: components directory)",
        },
        owner: {
          type: "string",
          description: 'Repository owner (default: "grafana")',
        },
        repo: {
          type: "string",
          description: 'Repository name (default: "grafana")',
        },
        branch: {
          type: "string",
          description: 'Branch name (default: "main")',
        },
      },
    },
  },
  get_component_documentation: {
    name: "get_component_documentation",
    description:
      "Get rich MDX documentation for a specific Grafana UI component",
    inputSchema: {
      type: "object",
      properties: {
        componentName: {
          type: "string",
          description:
            'Name of the Grafana UI component (e.g., "Button", "Alert")',
        },
      },
      required: ["componentName"],
    },
  },
  get_component_stories: {
    name: "get_component_stories",
    description:
      "Get parsed Storybook stories with interactive examples for a Grafana UI component",
    inputSchema: {
      type: "object",
      properties: {
        componentName: {
          type: "string",
          description:
            'Name of the Grafana UI component (e.g., "Button", "Alert")',
        },
      },
      required: ["componentName"],
    },
  },
  get_component_tests: {
    name: "get_component_tests",
    description:
      "Get test files showing usage patterns for a Grafana UI component",
    inputSchema: {
      type: "object",
      properties: {
        componentName: {
          type: "string",
          description:
            'Name of the Grafana UI component (e.g., "Button", "Alert")',
        },
      },
      required: ["componentName"],
    },
  },
  search_components: {
    name: "search_components",
    description:
      "Search Grafana UI components by name and optionally by documentation content",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query string",
        },
        includeDescription: {
          type: "boolean",
          description:
            "Whether to search in documentation content (default: false)",
        },
      },
      required: ["query"],
    },
  },
  get_theme_tokens: {
    name: "get_theme_tokens",
    description: "Get Grafana design system tokens and theme information",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description:
            "Token category to filter by (colors, typography, spacing, shadows, etc.)",
        },
      },
    },
  },
  get_component_dependencies: {
    name: "get_component_dependencies",
    description: "Get dependency tree analysis for a Grafana UI component",
    inputSchema: {
      type: "object",
      properties: {
        componentName: {
          type: "string",
          description:
            'Name of the Grafana UI component (e.g., "Button", "Alert")',
        },
        deep: {
          type: "boolean",
          description:
            "Whether to analyze dependencies recursively (default: false)",
        },
      },
      required: ["componentName"],
    },
  },
};

// Export tool handlers for backward compatibility
export const toolHandlers = {
  get_component: async ({ componentName }: { componentName: string }) => {
    const sourceCode = await axios.getComponentSource(componentName);
    return createSuccessResponse(sourceCode);
  },
  get_component_demo: async ({ componentName }: { componentName: string }) => {
    const demoCode = await axios.getComponentDemo(componentName);
    return createSuccessResponse(demoCode);
  },
  list_components: async () => {
    const components = await axios.getAvailableComponents();
    return createSuccessResponse({
      components: components.sort(),
      total: components.length,
    });
  },
  get_component_metadata: async ({
    componentName,
  }: {
    componentName: string;
  }) => {
    const metadata = await axios.getComponentMetadata(componentName);
    return createSuccessResponse(metadata);
  },
  get_directory_structure: async ({
    path,
    owner = axios.paths.REPO_OWNER,
    repo = axios.paths.REPO_NAME,
    branch = axios.paths.REPO_BRANCH,
  }: {
    path?: string;
    owner?: string;
    repo?: string;
    branch?: string;
  }) => {
    const directoryTree = await axios.buildDirectoryTree(
      owner,
      repo,
      path || axios.paths.COMPONENTS_PATH,
      branch,
    );
    return createSuccessResponse(directoryTree);
  },
  get_component_documentation: async ({
    componentName,
  }: {
    componentName: string;
  }) => {
    const mdxContent = await axios.getComponentDocumentation(componentName);
    const parsedContent = parseMDXContent(componentName, mdxContent);

    return createSuccessResponse({
      title: parsedContent.title,
      sections: parsedContent.sections.map((section) => ({
        title: section.title,
        level: section.level,
        content:
          section.content.substring(0, 500) +
          (section.content.length > 500 ? "..." : ""),
        examples: section.examples.length,
      })),
      totalExamples: parsedContent.examples.length,
      imports: parsedContent.imports,
      components: parsedContent.components,
    });
  },
  get_component_stories: async ({
    componentName,
  }: {
    componentName: string;
  }) => {
    const storyContent = await axios.getComponentDemo(componentName);
    const storyMetadata = parseStoryMetadata(componentName, storyContent);
    const examples = extractStoryExamples(storyContent);

    return createSuccessResponse({
      component: storyMetadata.componentName,
      meta: storyMetadata.meta,
      totalStories: storyMetadata.totalStories,
      hasInteractiveStories: storyMetadata.hasInteractiveStories,
      examples: examples.slice(0, 5),
      rawStoryCode:
        storyContent.substring(0, 1000) +
        (storyContent.length > 1000 ? "..." : ""),
    });
  },
  get_component_tests: async ({ componentName }: { componentName: string }) => {
    const testContent = await axios.getComponentTests(componentName);

    const testDescriptions = [];
    const testRegex = /(describe|it|test)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = testRegex.exec(testContent)) !== null) {
      testDescriptions.push({
        type: match[1],
        description: match[2],
      });
    }

    return createSuccessResponse({
      component: componentName,
      testDescriptions: testDescriptions.slice(0, 10),
      totalTests: testDescriptions.filter(
        (t) => t.type === "it" || t.type === "test",
      ).length,
      testCode:
        testContent.substring(0, 2000) +
        (testContent.length > 2000 ? "..." : ""),
    });
  },
  search_components: async ({
    query,
    includeDescription = false,
  }: {
    query: string;
    includeDescription?: boolean;
  }) => {
    const searchResults = await axios.searchComponents(
      query,
      includeDescription,
    );

    return createSuccessResponse({
      query,
      includeDescription,
      results: searchResults,
      totalResults: searchResults.length,
    });
  },
  get_theme_tokens: async ({ category }: { category?: string }) => {
    const themeFiles = await axios.getThemeFiles(category);

    const processedThemes: any = {};

    for (const [themeName, themeContent] of Object.entries(themeFiles.themes)) {
      if (typeof themeContent === "string") {
        const tokens = extractThemeTokens(themeContent);
        const metadata = extractThemeMetadata(themeContent);

        processedThemes[themeName] = {
          metadata,
          tokens: category ? filterTokensByCategory(tokens, category) : tokens,
        };
      }
    }

    return createSuccessResponse({
      category: category || "all",
      themes: processedThemes,
      availableThemes: Object.keys(processedThemes),
    });
  },
  get_component_dependencies: async ({
    componentName,
    deep = false,
  }: {
    componentName: string;
    deep?: boolean;
  }) => {
    const dependencies = await axios.getComponentDependencies(
      componentName,
      deep,
    );
    return createSuccessResponse(dependencies);
  },
};
