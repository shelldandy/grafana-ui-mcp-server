/**
 * Tools implementation for the Model Context Protocol (MCP) server.
 * 
 * This file defines the tools that can be called by the AI model through the MCP protocol.
 * Each tool has a schema that defines its parameters and a handler function that implements its logic.
 * 
 * Updated for shadcn/ui v4 with improved error handling and cleaner implementation.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { axios } from './utils/axios.js';
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
        text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
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
function createErrorResponse(message: string, code: ErrorCode = ErrorCode.InternalError) {
  throw new McpError(code, message);
}

/**
 * Define an MCP server for our tools
 */
export const server = new McpServer({
  name: "GrafanaUI Tools",
  version: "1.0.0"
});

// Tool: get_component - Fetch component source code
server.tool("get_component",
  'Get the source code for a specific Grafana UI component',
  { 
    componentName: z.string().describe('Name of the Grafana UI component (e.g., "Button", "Alert")') 
  },
  async ({ componentName }) => {
    try {
      const sourceCode = await axios.getComponentSource(componentName);
      return {
        content: [{ type: "text", text: sourceCode }]
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get component "${componentName}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// Tool: get_component_demo - Fetch component demo/example
server.tool("get_component_demo",
  'Get Storybook stories showing how a Grafana UI component should be used',
  { 
    componentName: z.string().describe('Name of the Grafana UI component (e.g., "Button", "Alert")') 
  },
  async ({ componentName }) => {
    try {
      const demoCode = await axios.getComponentDemo(componentName);
      return {
        content: [{ type: "text", text: demoCode }]
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get demo for component "${componentName}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// Tool: list_components - Get all available components
server.tool("list_components",
  'Get all available Grafana UI components',
  {},
  async () => {
    try {
      const components = await axios.getAvailableComponents();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({ 
            components: components.sort(),
            total: components.length 
          }, null, 2) 
        }]
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to list components: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// Tool: get_component_metadata - Get component metadata
server.tool("get_component_metadata",
  'Get metadata for a specific Grafana UI component',
  { 
    componentName: z.string().describe('Name of the Grafana UI component (e.g., "Button", "Alert")') 
  },
  async ({ componentName }) => {
    try {
      const metadata = await axios.getComponentMetadata(componentName);
      if (!metadata) {
        throw new McpError(ErrorCode.InvalidRequest, `Metadata not found for component "${componentName}"`);
      }
      
      return {
        content: [{ type: "text", text: JSON.stringify(metadata, null, 2) }]
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get metadata for component "${componentName}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// Tool: get_directory_structure - Get repository directory structure
server.tool("get_directory_structure",
  'Get the directory structure of the Grafana UI components',
  { 
    path: z.string().optional().describe('Path within the repository (default: components directory)'),
    owner: z.string().optional().describe('Repository owner (default: "grafana")'),
    repo: z.string().optional().describe('Repository name (default: "grafana")'),
    branch: z.string().optional().describe('Branch name (default: "main")')
  },
  async ({ path, owner, repo, branch }) => {
    try {
      const directoryTree = await axios.buildDirectoryTree(
        owner || axios.paths.REPO_OWNER,
        repo || axios.paths.REPO_NAME,
        path || axios.paths.COMPONENTS_PATH,
        branch || axios.paths.REPO_BRANCH
      );
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(directoryTree, null, 2)
        }]
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get directory structure: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);


// Export tools for backward compatibility
export const tools = {
  'get_component': {
    name: 'get_component',
    description: 'Get the source code for a specific Grafana UI component',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the Grafana UI component (e.g., "Button", "Alert")',
        },
      },
      required: ['componentName'],
    },
  },
  'get_component_demo': {
    name: 'get_component_demo',
    description: 'Get Storybook stories showing how a Grafana UI component should be used',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the Grafana UI component (e.g., "Button", "Alert")',
        },
      },
      required: ['componentName'],
    },
  },
  'list_components': {
    name: 'list_components',
    description: 'Get all available Grafana UI components',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  'get_component_metadata': {
    name: 'get_component_metadata',
    description: 'Get metadata for a specific Grafana UI component',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the Grafana UI component (e.g., "Button", "Alert")',
        },
      },
      required: ['componentName'],
    },
  },
  'get_directory_structure': {
    name: 'get_directory_structure',
    description: 'Get the directory structure of the Grafana UI components',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path within the repository (default: components directory)',
        },
        owner: {
          type: 'string',
          description: 'Repository owner (default: "grafana")',
        },
        repo: {
          type: 'string',
          description: 'Repository name (default: "grafana")',
        },
        branch: {
          type: 'string',
          description: 'Branch name (default: "main")',
        },
      },
    },
  },
};

// Export tool handlers for backward compatibility
export const toolHandlers = {
  "get_component": async ({ componentName }: { componentName: string }) => {
    const sourceCode = await axios.getComponentSource(componentName);
    return createSuccessResponse(sourceCode);
  },
  "get_component_demo": async ({ componentName }: { componentName: string }) => {
    const demoCode = await axios.getComponentDemo(componentName);
    return createSuccessResponse(demoCode);
  },
  "list_components": async () => {
    const components = await axios.getAvailableComponents();
    return createSuccessResponse({ 
      components: components.sort(),
      total: components.length 
    });
  },
  "get_component_metadata": async ({ componentName }: { componentName: string }) => {
    const metadata = await axios.getComponentMetadata(componentName);
    return createSuccessResponse(metadata);
  },
  "get_directory_structure": async ({ 
    path, 
    owner = axios.paths.REPO_OWNER, 
    repo = axios.paths.REPO_NAME, 
    branch = axios.paths.REPO_BRANCH 
  }: { 
    path?: string, 
    owner?: string, 
    repo?: string, 
    branch?: string 
  }) => {
    const directoryTree = await axios.buildDirectoryTree(
      owner,
      repo,
      path || axios.paths.COMPONENTS_PATH,
      branch
    );
    return createSuccessResponse(directoryTree);
  },
};