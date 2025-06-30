/**
 * Request handler setup for the Model Context Protocol (MCP) server.
 * 
 * This file configures how the server responds to various MCP requests by setting up
 * handlers for resources, resource templates, tools, and prompts.
 */
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import { resourceHandlers, resources } from "./resources.js";
import { promptHandlers, prompts } from "./prompts.js";
import { toolHandlers, tools, server as mcpServer } from "./tools.js";
import {
  getResourceTemplate,
  resourceTemplates,
} from "./resource-templates.js";
import { z } from "zod";

// Define basic component schemas here for tool validation
const componentSchema = { componentName: z.string() };
const componentWithTestsSchema = { componentName: z.string() };
const componentWithDepthSchema = { 
  componentName: z.string(), 
  deep: z.boolean().optional() 
};
const searchSchema = { 
  query: z.string(),
  includeDescription: z.boolean().optional()
};
const themesSchema = { 
  category: z.string().optional() 
};
const directorySchema = {
  path: z.string().optional(),
  owner: z.string().optional(),
  repo: z.string().optional(),
  branch: z.string().optional()
};

/**
 * Sets up all request handlers for the MCP server
 * @param server - The MCP server instance
 */
export const setupHandlers = (server: Server): void => {
  // List available resources when clients request them
  server.setRequestHandler(
    ListResourcesRequestSchema,
    () => ({ resources }),
  );
  
  // Resource Templates
  server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
    resourceTemplates,
  }));

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.values(tools),
  }));
  
  // Return resource content when clients request it
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params ?? {};
    
    try {
      // Check if this is a static resource
      const resourceHandler = resourceHandlers[uri as keyof typeof resourceHandlers];
      if (resourceHandler) {
        const result = await Promise.resolve(resourceHandler());
        // Ensure we're returning the expected structure with contents array
        // Format as text content with a resource-like uri
        return {
          contentType: result.contentType,
          contents: [{
            uri: uri, // Use the requested URI
            text: result.content // Use text field for plain content
          }]
        };
      }
      
      // Check if this is a generated resource from a template
      const resourceTemplateHandler = getResourceTemplate(uri);
      if (resourceTemplateHandler) {
        const result = await Promise.resolve(resourceTemplateHandler());
        // Ensure we're returning the expected structure with contents array
        return {
          contentType: result.contentType,
          contents: [{
            uri: uri, // Use the requested URI
            text: result.content // Use text field for plain content
          }]
        };
      }
      
      throw new McpError(ErrorCode.InvalidParams, `Resource not found: ${uri}`);
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError, 
        `Error processing resource: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, () => ({
    prompts: Object.values(prompts),
  }));

  // Get specific prompt content with optional arguments
  server.setRequestHandler(GetPromptRequestSchema, (request) => {
    const { name, arguments: args } = request.params;
    const promptHandler = promptHandlers[name as keyof typeof promptHandlers];
    if (promptHandler) return promptHandler(args as any);
    throw new McpError(ErrorCode.InvalidParams, `Prompt not found: ${name}`);
  });

  // Tool request Handler - executes the requested tool with provided parameters
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: params } = request.params ?? {};
    
    if (!name || typeof name !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, "Tool name is required");
    }
    
    const handler = toolHandlers[name as keyof typeof toolHandlers];

    if (!handler) {
      throw new McpError(ErrorCode.InvalidParams, `Tool not found: ${name}`);
    }

    try {
      // Validate tool input with Zod if applicable
      const toolSchema = getToolSchema(name);
      let validatedParams = params || {}; // Ensure params is never undefined
      
      if (toolSchema) {
        try {
          validatedParams = toolSchema.parse(validatedParams);
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            const errorMessages = validationError.errors.map(err => 
              `${err.path.join('.')}: ${err.message}`
            ).join(', ');
            
            throw new McpError(
              ErrorCode.InvalidParams, 
              `Invalid parameters: ${errorMessages}`
            );
          }
          throw validationError;
        }
      }
      
      // Ensure handler returns a Promise
      const result = await Promise.resolve(handler(validatedParams as any));
      return result;
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError, 
        `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
  
  // Add global error handler
  server.onerror = (error) => {
    console.error("[MCP Server Error]", error);
  };
};

/**
 * Get Zod schema for tool validation if available
 * @param toolName Name of the tool
 * @returns Zod schema or undefined
 */
function getToolSchema(toolName: string): z.ZodType | undefined {
  try {
    switch(toolName) {
      // Original tools
      case 'get_component':
      case 'get_component_demo':
      case 'get_component_metadata':
        return z.object(componentSchema);
        
      case 'get_directory_structure':
        return z.object(directorySchema);
        
      // New Grafana-specific tools
      case 'get_component_documentation':
      case 'get_component_stories':
      case 'get_component_tests':
        return z.object(componentWithTestsSchema);
        
      case 'get_component_dependencies':
        return z.object(componentWithDepthSchema);
        
      case 'search_components':
        return z.object(searchSchema);
        
      case 'get_theme_tokens':
        return z.object(themesSchema);
        
      default:
        return undefined;
    }
  } catch (error) {
    console.error("Error getting schema:", error);
    return undefined;
  }
}