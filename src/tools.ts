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
        type: "text" as const,
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

// Unified tool schema as raw shape for MCP server
const unifiedToolSchemaRaw = {
  action: z.enum([
    "get_component",
    "get_demo",
    "list_components",
    "get_metadata",
    "get_directory",
    "get_documentation",
    "get_stories",
    "get_tests",
    "search",
    "get_theme_tokens",
    "get_dependencies",
  ]),
  componentName: z.string().optional(),
  query: z.string().optional(),
  includeDescription: z.boolean().optional(),
  category: z.string().optional(),
  deep: z.boolean().optional(),
  path: z.string().optional(),
  owner: z.string().optional(),
  repo: z.string().optional(),
  branch: z.string().optional(),
};

// Unified tool schema with validation for handler.ts
const unifiedToolSchema = z
  .object({
    action: z.enum([
      "get_component",
      "get_demo",
      "list_components",
      "get_metadata",
      "get_directory",
      "get_documentation",
      "get_stories",
      "get_tests",
      "search",
      "get_theme_tokens",
      "get_dependencies",
    ]),
    componentName: z.string().optional(),
    query: z.string().optional(),
    includeDescription: z.boolean().optional(),
    category: z.string().optional(),
    deep: z.boolean().optional(),
    path: z.string().optional(),
    owner: z.string().optional(),
    repo: z.string().optional(),
    branch: z.string().optional(),
  })
  .refine(
    (data) => {
      // Validate required parameters based on action
      switch (data.action) {
        case "get_component":
        case "get_demo":
        case "get_metadata":
        case "get_documentation":
        case "get_stories":
        case "get_tests":
        case "get_dependencies":
          return !!data.componentName;
        case "search":
          return !!data.query;
        case "list_components":
        case "get_directory":
        case "get_theme_tokens":
          return true;
        default:
          return false;
      }
    },
    {
      message: "Missing required parameters for the specified action",
    },
  );

// Unified tool: grafana_ui - Single tool for all Grafana UI operations
server.tool(
  "grafana_ui",
  "Unified tool for accessing Grafana UI components, documentation, themes, and metadata",
  unifiedToolSchemaRaw,
  async (params) => {
    try {
      // Validate parameters based on action
      const validatedParams = unifiedToolSchema.parse(params);
      switch (validatedParams.action) {
        case "get_component":
          const sourceCode = await axios.getComponentSource(
            validatedParams.componentName!,
          );
          return createSuccessResponse(sourceCode);

        case "get_demo":
          const demoCode = await axios.getComponentDemo(
            validatedParams.componentName!,
          );
          return createSuccessResponse(demoCode);

        case "list_components":
          const components = await axios.getAvailableComponents();
          return createSuccessResponse({
            components: components.sort(),
            total: components.length,
          });

        case "get_metadata":
          const metadata = await axios.getComponentMetadata(
            validatedParams.componentName!,
          );
          if (!metadata) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Metadata not found for component "${validatedParams.componentName}"`,
            );
          }
          return createSuccessResponse(metadata);

        case "get_directory":
          const directoryTree = await axios.buildDirectoryTree(
            validatedParams.owner || axios.paths.REPO_OWNER,
            validatedParams.repo || axios.paths.REPO_NAME,
            validatedParams.path || axios.paths.COMPONENTS_PATH,
            validatedParams.branch || axios.paths.REPO_BRANCH,
          );
          return createSuccessResponse(directoryTree);

        case "get_documentation":
          const mdxContent = await axios.getComponentDocumentation(
            validatedParams.componentName!,
          );
          const parsedContent = parseMDXContent(
            validatedParams.componentName!,
            mdxContent,
          );
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

        case "get_stories":
          const storyContent = await axios.getComponentDemo(
            validatedParams.componentName!,
          );
          const storyMetadata = parseStoryMetadata(
            validatedParams.componentName!,
            storyContent,
          );
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

        case "get_tests":
          const testContent = await axios.getComponentTests(
            validatedParams.componentName!,
          );
          const testDescriptions = [];
          const testRegex = /(describe|it|test)\s*\(\s*['`"]([^'`"]+)['`"]/g;
          let match;
          while ((match = testRegex.exec(testContent)) !== null) {
            testDescriptions.push({
              type: match[1],
              description: match[2],
            });
          }
          return createSuccessResponse({
            component: validatedParams.componentName,
            testDescriptions: testDescriptions.slice(0, 10),
            totalTests: testDescriptions.filter(
              (t) => t.type === "it" || t.type === "test",
            ).length,
            testCode:
              testContent.substring(0, 2000) +
              (testContent.length > 2000 ? "..." : ""),
          });

        case "search":
          const searchResults = await axios.searchComponents(
            validatedParams.query!,
            validatedParams.includeDescription || false,
          );
          return createSuccessResponse({
            query: validatedParams.query,
            includeDescription: validatedParams.includeDescription || false,
            results: searchResults,
            totalResults: searchResults.length,
          });

        case "get_theme_tokens":
          const themeFiles = await axios.getThemeFiles(
            validatedParams.category,
          );
          const processedThemes: any = {};
          for (const [themeName, themeContent] of Object.entries(
            themeFiles.themes,
          )) {
            if (typeof themeContent === "string") {
              const tokens = extractThemeTokens(themeContent);
              const themeMetadata = extractThemeMetadata(themeContent);
              processedThemes[themeName] = {
                metadata: themeMetadata,
                tokens: validatedParams.category
                  ? filterTokensByCategory(tokens, validatedParams.category)
                  : tokens,
              };
            }
          }
          return createSuccessResponse({
            category: validatedParams.category || "all",
            themes: processedThemes,
            availableThemes: Object.keys(processedThemes),
          });

        case "get_dependencies":
          const dependencies = await axios.getComponentDependencies(
            validatedParams.componentName!,
            validatedParams.deep || false,
          );
          return createSuccessResponse(dependencies);

        default:
          throw new McpError(
            ErrorCode.InvalidParams,
            `Unknown action: ${validatedParams.action}`,
          );
      }
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }

      throw new McpError(
        ErrorCode.InternalError,
        `Failed to execute action "${(params as any).action}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
);

// Export tools for backward compatibility
export const tools = {
  grafana_ui: {
    name: "grafana_ui",
    description:
      "Unified tool for accessing Grafana UI components, documentation, themes, and metadata",
    inputSchema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: [
            "get_component",
            "get_demo",
            "list_components",
            "get_metadata",
            "get_directory",
            "get_documentation",
            "get_stories",
            "get_tests",
            "search",
            "get_theme_tokens",
            "get_dependencies",
          ],
          description: "The action to perform",
        },
        componentName: {
          type: "string",
          description:
            'Name of the Grafana UI component (e.g., "Button", "Alert")',
        },
        query: {
          type: "string",
          description: "Search query string (required for search action)",
        },
        includeDescription: {
          type: "boolean",
          description:
            "Whether to search in documentation content (default: false)",
        },
        category: {
          type: "string",
          description:
            "Token category to filter by (colors, typography, spacing, shadows, etc.)",
        },
        deep: {
          type: "boolean",
          description:
            "Whether to analyze dependencies recursively (default: false)",
        },
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
      required: ["action"],
    },
  },
};

// Export schema for use in handler.ts
export { unifiedToolSchema };

// Export tool handlers for backward compatibility
export const toolHandlers = {
  grafana_ui: async (params: any) => {
    try {
      switch (params.action) {
        case "get_component":
          const sourceCode = await axios.getComponentSource(
            params.componentName!,
          );
          return createSuccessResponse(sourceCode);

        case "get_demo":
          const demoCode = await axios.getComponentDemo(params.componentName!);
          return createSuccessResponse(demoCode);

        case "list_components":
          const components = await axios.getAvailableComponents();
          return createSuccessResponse({
            components: components.sort(),
            total: components.length,
          });

        case "get_metadata":
          const metadata = await axios.getComponentMetadata(
            params.componentName!,
          );
          return createSuccessResponse(metadata);

        case "get_directory":
          const directoryTree = await axios.buildDirectoryTree(
            params.owner || axios.paths.REPO_OWNER,
            params.repo || axios.paths.REPO_NAME,
            params.path || axios.paths.COMPONENTS_PATH,
            params.branch || axios.paths.REPO_BRANCH,
          );
          return createSuccessResponse(directoryTree);

        case "get_documentation":
          const mdxContent = await axios.getComponentDocumentation(
            params.componentName!,
          );
          const parsedContent = parseMDXContent(
            params.componentName!,
            mdxContent,
          );
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

        case "get_stories":
          const storyContent = await axios.getComponentDemo(
            params.componentName!,
          );
          const storyMetadata = parseStoryMetadata(
            params.componentName!,
            storyContent,
          );
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

        case "get_tests":
          const testContent = await axios.getComponentTests(
            params.componentName!,
          );
          const testDescriptions = [];
          const testRegex = /(describe|it|test)\s*\(\s*['`"]([^'`"]+)['`"]/g;
          let match;
          while ((match = testRegex.exec(testContent)) !== null) {
            testDescriptions.push({
              type: match[1],
              description: match[2],
            });
          }
          return createSuccessResponse({
            component: params.componentName,
            testDescriptions: testDescriptions.slice(0, 10),
            totalTests: testDescriptions.filter(
              (t) => t.type === "it" || t.type === "test",
            ).length,
            testCode:
              testContent.substring(0, 2000) +
              (testContent.length > 2000 ? "..." : ""),
          });

        case "search":
          const searchResults = await axios.searchComponents(
            params.query!,
            params.includeDescription || false,
          );
          return createSuccessResponse({
            query: params.query,
            includeDescription: params.includeDescription || false,
            results: searchResults,
            totalResults: searchResults.length,
          });

        case "get_theme_tokens":
          const themeFiles = await axios.getThemeFiles(params.category);
          const processedThemes: any = {};
          for (const [themeName, themeContent] of Object.entries(
            themeFiles.themes,
          )) {
            if (typeof themeContent === "string") {
              const tokens = extractThemeTokens(themeContent);
              const themeMetadata = extractThemeMetadata(themeContent);
              processedThemes[themeName] = {
                metadata: themeMetadata,
                tokens: params.category
                  ? filterTokensByCategory(tokens, params.category)
                  : tokens,
              };
            }
          }
          return createSuccessResponse({
            category: params.category || "all",
            themes: processedThemes,
            availableThemes: Object.keys(processedThemes),
          });

        case "get_dependencies":
          const dependencies = await axios.getComponentDependencies(
            params.componentName!,
            params.deep || false,
          );
          return createSuccessResponse(dependencies);

        default:
          throw new McpError(
            ErrorCode.InvalidParams,
            `Unknown action: ${params.action}`,
          );
      }
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to execute action "${params.action}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};
