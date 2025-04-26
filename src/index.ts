/**
 * Main entry point for the Model Context Protocol (MCP) server.
 * 
 * This file initializes the MCP server with the appropriate configuration
 * and connects it to a stdio transport for communication.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupHandlers } from './handler.js';

// Initialize the MCP server with metadata and capabilities
const server = new Server(
  {
    name: "shadcn-ui",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},      // Will be filled with registered resources
      prompts: {},        // Will be filled with registered prompts
      tools: {},          // Will be filled with registered tools
    },
  }
);

// Set up request handlers and register components (tools, resources, etc.)
setupHandlers(server);

// Start server using stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.info('{"jsonrpc": "2.0", "method": "log", "params": { "message": "Server running..." }}');