/**
 * Tools implementation for the Model Context Protocol (MCP) server.
 * 
 * This file defines the tools that can be called by the AI model through the MCP protocol.
 * Each tool has a schema that defines its parameters and a handler function that implements its logic.
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
 * Define an MCP server for our tools
 */
export const server = new McpServer({
  name: "ShadcnUI Tools",
  version: "1.0.0"
});

// Add the get_component tool
server.tool("get_component",
  { componentName: z.string().describe('Name of the shadcn/ui component (e.g., "accordion", "button")') },
  async ({ componentName }) => {
    try {
      const name = componentName.toLowerCase();
      
      // Fetch the component from GitHub
      try {
        // Many components are directly named, like button.tsx
        const response = await axios.githubRaw.get(`/registry/new-york-v4/ui/${name}.tsx`);
        return {
          content: [{ type: "text", text: response.data }]
        };
      } catch (error) {
        // Some components might be in a directory structure like accordion/accordion.tsx
        // If the first attempt fails, try this alternative path
        try {
          const response = await axios.githubRaw.get(`/registry/new-york-v4/ui/${name}.tsx`);
          return {
            content: [{ type: "text", text: response.data }]
          };
        } catch (nestedError) {
          // If both approaches fail, check each GitHub directory
          for (const dir of axios.githubDirectories) {
            try {
              const response = await axios.githubRaw.get(`${dir}/${name}.tsx`);
              return {
                content: [{ type: "text", text: response.data }]
              };
            } catch (dirError) {
              // Continue to next directory
            }
          }
          
          // If we've tried all options and still failed, throw the original error
          throw error;
        }
      }
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get component source code: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// Add the get_component_demo tool
server.tool("get_component_demo",
  { componentName: z.string().describe('Name of the shadcn/ui component (e.g., "accordion", "button")') },
  async ({ componentName }) => {
    try {
      const name = componentName.toLowerCase();
      
      // Fetch the component demo from GitHub
      try {
        // Try the demo file directly - many components have a demo file named like button-demo.tsx
        const response = await axios.githubRaw.get(`/components/${name}-demo.tsx`);
        return {
          content: [{ type: "text", text: response.data }]
        };
      } catch (error) {
        // If that fails, try looking in the examples directory
        try {
          const response = await axios.githubRaw.get(`/examples/${name}-example.tsx`);
          return {
            content: [{ type: "text", text: response.data }]
          };
        } catch (exampleError) {
          // As a last resort, try the special case where demos might be in a subfolder
          try {
            const response = await axios.githubRaw.get(`/components/${name}/${name}-demo.tsx`);
            return {
              content: [{ type: "text", text: response.data }]
            };
          } catch (nestedError) {
            // If all approaches fail, throw the original error
            throw error;
          }
        }
      }
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to get component demo code: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
);

// Add new get_directory_structure tool
server.tool("get_directory_structure",
  { 
    path: z.string().optional().describe('Path within the repository (e.g., "ui", "registry/new-york-v4")'),
    owner: z.string().optional().describe('Repository owner (default: "shadcn-ui")'),
    repo: z.string().optional().describe('Repository name (default: "ui")'),
    branch: z.string().optional().describe('Branch name (default: "main")')
  },
  async ({ path, owner, repo, branch }) => {
    try {
      // Set default path if not provided
      const repoPath = path || 'apps/v4/registry/new-york-v4';
      
      // Build directory tree structure
      const directoryTree = await axios.buildDirectoryTree(
        owner || 'shadcn-ui',
        repo || 'ui',
        repoPath,
        branch || 'main'
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

// Export function implementations for compatibility with existing code
const getComponent = async ({ componentName }: { componentName: string }) => {
  try {
    const name = componentName.toLowerCase();
    
    // Fetch the component from GitHub
    try {
      const response = await axios.githubRaw.get(`/registry/new-york-v4/ui/${name}.tsx`);
      return createSuccessResponse(response.data);
    } catch (error) {
      // Check alternative paths and directories as in the server.tool implementation
      try {
        const response = await axios.githubRaw.get(`/registry/new-york-v4/ui/${name}.tsx`);
        return createSuccessResponse(response.data);
      } catch (nestedError) {
        for (const dir of axios.githubDirectories) {
          try {
            const response = await axios.githubRaw.get(`${dir}/${name}.tsx`);
            return createSuccessResponse(response.data);
          } catch (dirError) {
            // Continue to next directory
          }
        }
        throw error;
      }
    }
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(ErrorCode.InternalError, `Failed to get component source code: ${error instanceof Error ? error.message : String(error)}`);
  }
};

const getComponentDemo = async ({ componentName }: { componentName: string }) => {
  try {
    const name = componentName.toLowerCase();
    
    try {
      const response = await axios.githubRaw.get(`/components/${name}-demo.tsx`);
      return createSuccessResponse(response.data);
    } catch (error) {
      try {
        const response = await axios.githubRaw.get(`/examples/${name}-example.tsx`);
        return createSuccessResponse(response.data);
      } catch (exampleError) {
        try {
          const response = await axios.githubRaw.get(`/components/${name}/${name}-demo.tsx`);
          return createSuccessResponse(response.data);
        } catch (nestedError) {
          throw error;
        }
      }
    }
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(ErrorCode.InternalError, `Failed to get component demo code: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Add new directory structure function
const getDirectoryStructure = async ({ 
  path, 
  owner = 'shadcn-ui', 
  repo = 'ui', 
  branch = 'main' 
}: { 
  path?: string, 
  owner?: string, 
  repo?: string, 
  branch?: string 
}) => {
  try {
    // Set default path if not provided
    const repoPath = path || 'apps/v4/registry/new-york-v4';
    
    // Build directory tree structure
    const directoryTree = await axios.buildDirectoryTree(owner, repo, repoPath, branch);
    return createSuccessResponse(directoryTree);
  } catch (error) {
    if (error instanceof McpError) throw error;
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get directory structure: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// Export tools for compatibility with existing code
export const tools = {
  'get_component': {
    name: 'get_component',
    description: 'Get the source code for a specific shadcn/ui component',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the shadcn/ui component (e.g., "accordion", "button")',
        },
      },
      required: ['componentName'],
    },
  },
  'get_component_demo': {
    name: 'get_component_demo',
    description: 'Get demo code illustrating how a shadcn/ui component should be used',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the shadcn/ui component (e.g., "accordion", "button")',
        },
      },
      required: ['componentName'],
    },
  },
  'get_directory_structure': {
    name: 'get_directory_structure',
    description: 'Get the directory structure of the shadcn-ui repository',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path within the repository (e.g., "ui", "registry/new-york-v4")',
        },
        owner: {
          type: 'string',
          description: 'Repository owner (default: "shadcn-ui")',
        },
        repo: {
          type: 'string',
          description: 'Repository name (default: "ui")',
        },
        branch: {
          type: 'string',
          description: 'Branch name (default: "main")',
        },
      },
    },
  },
};

// Export tool handlers for compatibility with existing code
export const toolHandlers = {
  "get_component": getComponent,
  "get_component_demo": getComponentDemo,
  "get_directory_structure": getDirectoryStructure,
};