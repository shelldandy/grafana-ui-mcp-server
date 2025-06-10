# Shadcn UI v4 MCP Server

[![npm version](https://badge.fury.io/js/shadcn-ui-mcp-server.svg)](https://badge.fury.io/js/shadcn-ui-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that provides AI assistants with comprehensive access to [shadcn/ui v4](https://ui.shadcn.com/) components, blocks, demos, and metadata. This server enables AI tools like Claude Desktop, Continue.dev, and other MCP-compatible clients to retrieve and work with shadcn/ui components seamlessly.

## 🚀 Key Features

- **Component Source Code**: Get the latest shadcn/ui v4 component TypeScript source
- **Component Demos**: Access example implementations and usage patterns  
- **Blocks Support**: Retrieve complete block implementations (dashboards, calendars, login forms, etc.)
- **Metadata Access**: Get component dependencies, descriptions, and configuration details
- **Directory Browsing**: Explore the shadcn/ui repository structure
- **GitHub API Integration**: Efficient caching and intelligent rate limit handling

## 📦 Quick Start

### ⚡ Using npx (Recommended)

The fastest way to get started - no installation required!

```bash
# Basic usage (rate limited to 60 requests/hour)
npx shadcn-ui-mcp-server

# With GitHub token for better rate limits (5000 requests/hour)
npx shadcn-ui-mcp-server --github-api-key ghp_your_token_here

# Short form
npx shadcn-ui-mcp-server -g ghp_your_token_here

# Using environment variable
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
npx shadcn-ui-mcp-server
```

**🎯 Try it now**: Run `npx shadcn-ui-mcp-server --help` to see all options!

### 🔧 Command Line Options

```bash
shadcn-ui-mcp-server [options]

Options:
  --github-api-key, -g <token>    GitHub Personal Access Token
  --help, -h                      Show help message  
  --version, -v                   Show version information

Environment Variables:
  GITHUB_PERSONAL_ACCESS_TOKEN    Alternative way to provide GitHub token

Examples:
  npx shadcn-ui-mcp-server --help
  npx shadcn-ui-mcp-server --version
  npx shadcn-ui-mcp-server -g ghp_1234567890abcdef
  GITHUB_PERSONAL_ACCESS_TOKEN=ghp_token npx shadcn-ui-mcp-server
```

## 🔑 GitHub API Token Setup

**Why do you need a token?**
- Without token: Limited to 60 API requests per hour
- With token: Up to 5,000 requests per hour
- Better reliability and faster responses

### 📝 Getting Your Token (2 minutes)

1. **Go to GitHub Settings**:
   - Visit [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
   - Or: GitHub Profile → Settings → Developer settings → Personal access tokens

2. **Generate New Token**:
   - Click "Generate new token (classic)"
   - Add a note: "shadcn-ui MCP server"
   - **Expiration**: Choose your preference (90 days recommended)
   - **Scopes**: ✅ **No scopes needed!** (public repository access is sufficient)

3. **Copy Your Token**:
   - Copy the generated token (starts with `ghp_`)
   - ⚠️ **Save it securely** - you won't see it again!

### 🚀 Using Your Token

**Method 1: Command Line (Quick testing)**
```bash
npx shadcn-ui-mcp-server --github-api-key ghp_your_token_here
```

**Method 2: Environment Variable (Recommended)**
```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here

# Then simply run:
npx shadcn-ui-mcp-server
```

**Method 3: Claude Desktop Configuration**
```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["shadcn-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

### ✅ Verify Your Setup

```bash
# Test without token (should show rate limit warning)
npx shadcn-ui-mcp-server --help

# Test with token (should show success message)
npx shadcn-ui-mcp-server --github-api-key ghp_your_token --help

# Check your current rate limit
curl -H "Authorization: token ghp_your_token" https://api.github.com/rate_limit
```

## 🛠️ Available Tools

The MCP server provides these tools for AI assistants:

### Component Tools

- **`get_component`** - Get component source code
- **`get_component_demo`** - Get component usage examples
- **`list_components`** - List all available components
- **`get_component_metadata`** - Get component dependencies and info

### Block Tools

- **`get_block`** - Get complete block implementations (dashboard-01, calendar-01, etc.)
- **`list_blocks`** - List all available blocks with categories

### Repository Tools

- **`get_directory_structure`** - Explore the shadcn/ui repository structure

### Example Tool Usage

```typescript
// These tools can be called by AI assistants via MCP protocol

// Get button component source
{
  "tool": "get_component",
  "arguments": { "componentName": "button" }
}

// List all components
{
  "tool": "list_components",
  "arguments": {}
}

// Get dashboard block
{
  "tool": "get_block", 
  "arguments": { "blockName": "dashboard-01" }
}
```

## 💡 Real-World Usage Examples

### Example 1: Building a Login Form

**Scenario**: You want to create a login form using shadcn/ui components.

```bash
# Start the MCP server
npx shadcn-ui-mcp-server --github-api-key ghp_your_token_here
```

**Ask your AI assistant**: *"Help me build a login form using shadcn/ui components"*

The AI can then use these tools:
1. `list_components` → Find relevant components (input, button, form, card)
2. `get_component` for each component → Get source code
3. `get_component_demo` → See usage examples
4. `get_block` → Check if there's a pre-built login block

**Result**: Complete login form with proper shadcn/ui component implementation.

### Example 2: Creating a Dashboard

**Scenario**: Building a data dashboard with charts and tables.

**AI Assistant Query**: *"I need to create a dashboard with data tables, charts, and a sidebar navigation"*

**MCP Tools Used**:
```json
// Check available dashboard blocks
{ "tool": "list_blocks", "arguments": { "category": "dashboard" } }

// Get a complete dashboard implementation
{ "tool": "get_block", "arguments": { "blockName": "dashboard-01", "includeComponents": true } }

// Get individual components for customization
{ "tool": "get_component", "arguments": { "componentName": "data-table" } }
{ "tool": "get_component", "arguments": { "componentName": "chart" } }
{ "tool": "get_component_metadata", "arguments": { "componentName": "data-table" } }
```

**Result**: Complete dashboard with sidebar, data tables, charts, and proper TypeScript types.

### Example 3: Component Discovery and Learning

**Scenario**: Learning about available shadcn/ui v4 components and their capabilities.

**AI Assistant Query**: *"What new components are available in shadcn/ui v4?"*

```json
// Get all available components
{ "tool": "list_components", "arguments": {} }

// Explore specific components
{ "tool": "get_component_metadata", "arguments": { "componentName": "breadcrumb" } }
{ "tool": "get_component_demo", "arguments": { "componentName": "breadcrumb" } }

// Check repository structure for new features
{ "tool": "get_directory_structure", "arguments": { "path": "apps/www/registry/new-york/ui" } }
```

**Result**: Comprehensive overview of all v4 components with usage examples and metadata.

### Example 4: Form Building with Validation

**Scenario**: Creating complex forms with validation using shadcn/ui and react-hook-form.

**AI Assistant Query**: *"Help me build a user registration form with validation"*

```json
// Get form-related components
{ "tool": "get_component", "arguments": { "componentName": "form" } }
{ "tool": "get_component", "arguments": { "componentName": "input" } }
{ "tool": "get_component", "arguments": { "componentName": "select" } }
{ "tool": "get_component", "arguments": { "componentName": "checkbox" } }

// Get usage examples
{ "tool": "get_component_demo", "arguments": { "componentName": "form" } }

// Check for pre-built form blocks
{ "tool": "list_blocks", "arguments": { "category": "authentication" } }
```

**Result**: Complete form implementation with proper validation, error handling, and shadcn/ui styling.

### Example 5: Exploring Block Categories

**Scenario**: Understanding what pre-built UI blocks are available.

```bash
# Using environment variable for token
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
npx shadcn-ui-mcp-server
```

**AI Assistant Queries**:
- *"Show me all available UI blocks"*
- *"What calendar components are available?"*
- *"I need examples of sidebar layouts"*

```json
// Explore all blocks
{ "tool": "list_blocks", "arguments": {} }

// Filter by category
{ "tool": "list_blocks", "arguments": { "category": "calendar" } }
{ "tool": "list_blocks", "arguments": { "category": "sidebar" } }
{ "tool": "list_blocks", "arguments": { "category": "dashboard" } }

// Get specific block implementation
{ "tool": "get_block", "arguments": { "blockName": "sidebar-01" } }
{ "tool": "get_block", "arguments": { "blockName": "calendar-01" } }
```

**Result**: Complete catalog of available blocks with full implementation details.

## 🎯 Integration Workflows

### Claude Desktop Workflow

1. **Setup** (`~/.config/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["shadcn-ui-mcp-server", "--github-api-key", "ghp_your_token_here"]
    }
  }
}
```

2. **Usage in Claude**:
   - "Help me implement a data table component"
   - "Show me the latest button component from shadcn/ui v4"
   - "I need a complete dashboard layout"
   - "What's the proper way to use the new form component?"

### Continue.dev Workflow

1. **Setup** (`.continue/config.json`):
```json
{
  "models": [...],
  "tools": [{
    "name": "shadcn-ui",
    "type": "mcp",
    "command": "npx",
    "args": ["shadcn-ui-mcp-server"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
    }
  }]
}
```

2. **Usage in Continue.dev**:
   - Highlight code and ask: "Convert this to use shadcn/ui components"
   - "Add a sidebar to this layout using shadcn/ui"
   - "Show me the source code for the accordion component"

### VS Code with MCP Extension

1. **Setup**: Install MCP extension and configure:
```json
{
  "mcp.servers": [{
    "name": "shadcn-ui",
    "command": "npx",
    "args": ["shadcn-ui-mcp-server", "-g", "ghp_your_token"]
  }]
}
```

2. **Usage**: Access shadcn/ui components directly in your editor through the MCP extension.

## 🚀 Advanced Usage Patterns

### Batch Component Analysis

```typescript
// Custom MCP client for batch operations
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client(/* ... */);

// Get multiple components at once
const components = ['button', 'input', 'form', 'dialog'];
const componentData = await Promise.all(
  components.map(name => 
    client.callTool({
      name: "get_component",
      arguments: { componentName: name }
    })
  )
);
```

### Repository Exploration

```json
// Explore different parts of the shadcn/ui repository
{ "tool": "get_directory_structure", "arguments": { 
    "path": "apps/www/registry/new-york/blocks" 
  } }

{ "tool": "get_directory_structure", "arguments": { 
    "path": "apps/www/registry/new-york/ui" 
  } }

{ "tool": "get_directory_structure", "arguments": { 
    "path": "apps/www/registry/new-york/example" 
  } }
```

### Component Dependency Analysis

```json
// Understand component dependencies
{ "tool": "get_component_metadata", "arguments": { "componentName": "data-table" } }
{ "tool": "get_component_metadata", "arguments": { "componentName": "dialog" } }
{ "tool": "get_component_metadata", "arguments": { "componentName": "form" } }
```

## 📊 Performance Tips

### Efficient Token Usage

```bash
# Cache results by setting up the server once
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
npx shadcn-ui-mcp-server

# The server includes intelligent caching:
# - Frequently accessed components are cached in memory
# - API calls are batched when possible
# - Automatic retry with exponential backoff
```

### Rate Limit Management

```bash
# Without token: 60 requests/hour
npx shadcn-ui-mcp-server

# With token: 5000 requests/hour (for authenticated users)
npx shadcn-ui-mcp-server --github-api-key ghp_your_token_here

# Check your rate limit status via GitHub API:
curl -H "Authorization: token ghp_your_token_here" \
  https://api.github.com/rate_limit
```

## 🔗 Integration with AI Tools

### Claude Desktop

Add to your Claude Desktop configuration (`~/.config/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["shadcn-ui-mcp-server", "--github-api-key", "ghp_your_token_here"]
    }
  }
}
```

Or with environment variable:

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["shadcn-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**Example Claude Conversations:**
- *"Help me implement a responsive data table using shadcn/ui v4 components"*
- *"Show me the latest button variants available in shadcn/ui"*
- *"I need a complete authentication form with validation"*
- *"What's the difference between the old and new form components?"*

### Continue.dev

Add to your Continue configuration (`.continue/config.json`):

```json
{
  "models": [...],
  "tools": [
    {
      "name": "shadcn-ui",
      "type": "mcp",
      "serverName": "shadcn-ui",
      "command": "npx",
      "args": ["shadcn-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  ]
}
```

**Example Continue.dev Usage:**
1. Highlight existing HTML/React code
2. Ask: *"Convert this to use shadcn/ui components"*
3. The AI will use the MCP server to get the latest component implementations
4. Receive updated code with proper shadcn/ui components

### Codeium Chat

For Codeium integration, start the server in your terminal:

```bash
npx shadcn-ui-mcp-server --github-api-key ghp_your_token_here
```

Then reference the available tools in your Codeium chat conversations.

### Cursor IDE

Cursor can work with MCP servers through its chat interface. Configure similar to Continue.dev:

```json
{
  "mcp": {
    "servers": [{
      "name": "shadcn-ui",
      "command": "npx",
      "args": ["shadcn-ui-mcp-server", "-g", "ghp_your_token_here"]
    }]
  }
}
```

### Custom MCP Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Initialize the transport
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['shadcn-ui-mcp-server', '--github-api-key', 'ghp_your_token_here']
});

// Create and connect the client
const client = new Client({
  name: "my-shadcn-client",
  version: "1.0.0"
}, {
  capabilities: {}
});

await client.connect(transport);

// Example: Get all available components
const tools = await client.listTools();
console.log('Available tools:', tools.tools.map(t => t.name));

// Example: Get button component source
const buttonResult = await client.callTool({
  name: "get_component",
  arguments: { componentName: "button" }
});
console.log('Button component source:', buttonResult.content[0].text);

// Example: Get dashboard block
const dashboardResult = await client.callTool({
  name: "get_block",
  arguments: { 
    blockName: "dashboard-01", 
    includeComponents: true 
  }
});
console.log('Dashboard block:', JSON.parse(dashboardResult.content[0].text));

// Example: List all blocks in calendar category
const calendarBlocks = await client.callTool({
  name: "list_blocks",
  arguments: { category: "calendar" }
});
console.log('Calendar blocks:', JSON.parse(calendarBlocks.content[0].text));

// Clean up
await client.close();
```

### Shell/Terminal Integration

```bash
#!/bin/bash
# Example: Automated component fetching script

GITHUB_TOKEN="ghp_your_token_here"

# Start MCP server in background
npx shadcn-ui-mcp-server --github-api-key $GITHUB_TOKEN &
SERVER_PID=$!

# Function to call MCP tools (pseudo-code)
# In practice, you'd use a proper MCP client library

echo "Fetching all shadcn/ui components..."
# Your MCP client calls here

# Cleanup
kill $SERVER_PID
```

## 📦 Alternative Installation Methods

<details>
<summary><strong>🌍 Global Installation</strong> (Click to expand)</summary>

Install once, use everywhere with a shorter command:

```bash
# Install globally
npm install -g shadcn-ui-mcp-server

# Use the shorter command
shadcn-mcp --github-api-key ghp_your_token_here

# Or just
shadcn-mcp  # if token is in environment
```

**Benefits:**
- Shorter command (`shadcn-mcp` instead of `npx shadcn-ui-mcp-server`)
- No download time on subsequent uses
- Works offline once installed

**Drawbacks:**
- Takes up global npm space
- Need to manually update with `npm update -g shadcn-ui-mcp-server`

</details>

<details>
<summary><strong>📁 Local Project Installation</strong> (Click to expand)</summary>

Add to your project's dependencies:

```bash
# Install in your project
npm install --save-dev shadcn-ui-mcp-server

# Use via npm scripts
npm exec shadcn-ui-mcp-server -- --github-api-key ghp_your_token

# Or add to package.json scripts:
{
  "scripts": {
    "shadcn-mcp": "shadcn-ui-mcp-server",
    "ai-setup": "shadcn-ui-mcp-server --github-api-key $GITHUB_TOKEN"
  }
}

# Then run:
npm run shadcn-mcp
npm run ai-setup
```

**Benefits:**
- Version locked to your project
- Included in project dependencies
- Team members get the same version

**Drawbacks:**
- Larger node_modules
- Only available within the project

</details>

## 🛠️ Development

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/shadcn-ui-mcp-server.git
cd shadcn-ui-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Run locally
npm run start

# Or with token
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token npm run start
```

### Building for Distribution

```bash
# Clean and build
npm run clean
npm run build

# Test the build
node build/index.js --help

# Prepare for publishing
npm run prepublishOnly
```

### Publishing to npm

```bash
# Login to npm (first time only)
npm login

# Publish the package
npm publish

# Publish with tag
npm publish --tag beta
```

## 📚 API Reference

### Tool Specifications

All tools follow the MCP tool specification format:

```typescript
interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

interface ToolResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
}
```

### Component Tools

#### `get_component`
```typescript
{
  name: "get_component",
  arguments: {
    componentName: string // e.g., "button", "dialog", "accordion"
  }
}
```

#### `get_component_demo`
```typescript
{
  name: "get_component_demo", 
  arguments: {
    componentName: string
  }
}
```

#### `list_components`
```typescript
{
  name: "list_components",
  arguments: {} // No arguments required
}
```

#### `get_component_metadata`
```typescript
{
  name: "get_component_metadata",
  arguments: {
    componentName: string
  }
}
```

### Block Tools

#### `get_block`
```typescript
{
  name: "get_block",
  arguments: {
    blockName: string, // e.g., "dashboard-01", "calendar-01"
    includeComponents?: boolean // default: true
  }
}
```

#### `list_blocks`
```typescript
{
  name: "list_blocks",
  arguments: {
    category?: string // "calendar", "dashboard", "login", etc.
  }
}
```

### Repository Tools

#### `get_directory_structure`
```typescript
{
  name: "get_directory_structure",
  arguments: {
    path?: string,    // default: shadcn/ui v4 registry
    owner?: string,   // default: "shadcn-ui"
    repo?: string,    // default: "ui"
    branch?: string   // default: "main"
  }
}
```

## ⚡ Performance & Caching

The server includes intelligent caching mechanisms:

- **Memory Caching**: Frequently accessed components are cached in memory
- **Rate Limit Handling**: Automatic retry with exponential backoff
- **Efficient API Usage**: Batched requests where possible
- **Error Recovery**: Graceful handling of GitHub API errors

## 🐛 Troubleshooting

### Common Issues

**"Rate limit exceeded" errors:**
```bash
# Solution: Add GitHub API token
npx shadcn-ui-mcp-server --github-api-key ghp_your_token_here
```

**"Command not found" errors:**
```bash
# Solution: Install Node.js 18+ and ensure npx is available
node --version  # Should be 18+
npx --version   # Should work
```

**Component not found:**
```bash
# Check available components first
npx shadcn-ui-mcp-server
# Then call list_components tool via your MCP client
```

**Network/proxy issues:**
```bash
# Set proxy if needed
export HTTP_PROXY=http://your-proxy:8080
export HTTPS_PROXY=http://your-proxy:8080
npx shadcn-ui-mcp-server
```

### Debug Mode

Enable verbose logging:

```bash
# Set debug environment variable
DEBUG=* npx shadcn-ui-mcp-server --github-api-key ghp_your_token
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- 🐛 [Report Issues](https://github.com/Jpisnice/shadcn-ui-mcp-server/issues)
- 💬 [Discussions](https://github.com/Jpisnice/shadcn-ui-mcp-server/discussions)
- 📖 [Documentation](https://github.com/Jpisnice/shadcn-ui-mcp-server#readme)
- 📦 [npm Package](https://www.npmjs.com/package/shadcn-ui-mcp-server)

## 🔗 Related Projects

- [shadcn/ui](https://ui.shadcn.com/) - The component library this server provides access to
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol specification
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - Official MCP SDK

## ⭐ Acknowledgments

- [shadcn](https://github.com/shadcn) for the amazing UI component library
- [Anthropic](https://anthropic.com) for the Model Context Protocol specification
- The open source community for inspiration and contributions

---

**Made with ❤️ by [Janardhan Polle](https://github.com/Jpisnice)**

**Star ⭐ this repo if you find it helpful!**