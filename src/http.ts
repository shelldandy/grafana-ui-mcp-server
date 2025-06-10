/**
 * HTTP server implementation for the Model Context Protocol (MCP) server.
 * 
 * This file creates an Express server that exposes the MCP server using 
 * Server-Sent Events (SSE) for real-time communication.
 */
import express, { Request, Response } from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { setupHandlers } from './handler.js';
import { axios } from './utils/axios.js';
import cors from 'cors';

// Parse command line arguments for GitHub API key
const args = process.argv.slice(2);
const githubApiKeyIndex = args.findIndex(arg => arg === '--github-api-key' || arg === '-g');
if (githubApiKeyIndex !== -1 && args[githubApiKeyIndex + 1]) {
  const apiKey = args[githubApiKeyIndex + 1];
  axios.setGitHubApiKey(apiKey);
  console.log('GitHub API key configured successfully for HTTP server');
}

// Initialize the MCP server with metadata and capabilities
// This mirrors the configuration in index.ts
const server = new Server(
  {
    name: "my-mcp",
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

// Set up request handlers and register components (tools, resources, prompts)
setupHandlers(server);

// Create Express application
const app = express();

// Enable CORS for all routes
app.use(cors());

// IMPORTANT: Do NOT use express.json() middleware globally
// as it will consume the request stream and make it unreadable for the SSE transport
// Remove this line: app.use(express.json());

// Store transports for multiple simultaneous connections
const transports: {[sessionId: string]: SSEServerTransport} = {};

// SSE endpoint
app.get("/sse", async (_: Request, res: Response) => {
  // Create a new SSE transport for this connection
  const transport = new SSEServerTransport('/messages', res);
  
  // Store the transport using the sessionId as the key
  transports[transport.sessionId] = transport;
  
  // Clean up when the connection is closed
  res.on("close", () => {
    delete transports[transport.sessionId];
    console.log(`Client disconnected: ${transport.sessionId}`);
  });
  
  console.log(`Client connected: ${transport.sessionId}`);
  
  // Connect the transport to the MCP server
  await server.connect(transport);
});

// Message handling endpoint
// Do NOT use express.json() middleware for this route
app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  
  if (!sessionId) {
    res.status(400).send('Missing sessionId parameter');
    return;
  }
  
  const transport = transports[sessionId];
  
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(404).send('No active connection found for this sessionId');
  }
});

// Default port is 3001, but can be configured via environment variable
const PORT = process.env.PORT || 3000;

// Start the server
const httpServer = app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
  console.log(`SSE endpoint available at http://localhost:${PORT}/sse`);
  console.log(`Message endpoint available at http://localhost:${PORT}/messages`);
});

// Export for testing or further configuration
export { app, server, httpServer };