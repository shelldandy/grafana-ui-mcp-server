# Grafana UI MCP Server

[![npm version](https://badge.fury.io/js/@shelldandy%2Fgrafana-ui-mcp-server.svg)](https://badge.fury.io/js/@shelldandy/grafana-ui-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that provides AI assistants with comprehensive access to [Grafana UI](https://github.com/grafana/grafana/tree/main/packages/grafana-ui) components, documentation, stories, and design system tokens. This server enables AI tools like Claude Desktop, Continue.dev, and other MCP-compatible clients to retrieve and work with Grafana's React component library seamlessly.

## 🚀 Key Features

- **Complete Component Access**: Get the latest Grafana UI component TypeScript source code
- **Rich Documentation**: Access comprehensive MDX documentation with usage guidelines
- **Interactive Stories**: Retrieve Storybook stories with interactive examples and controls
- **Test Files**: Access test files showing real usage patterns and edge cases
- **Design System Integration**: Get Grafana's design tokens (colors, typography, spacing, shadows)
- **Dependency Analysis**: Understand component relationships and dependency trees
- **Advanced Search**: Search components by name and documentation content
- **GitHub API Integration**: Efficient caching and intelligent rate limit handling

## 🛠️ Unified Tool Interface

This MCP server provides a **single unified tool** called `grafana_ui` that consolidates all functionality through action-based routing. This reduces complexity and makes it easier for AI agents to understand and use.

### 🎯 The `grafana_ui` Tool

All operations are performed through one tool with an `action` parameter:

```typescript
{
  "tool": "grafana_ui",
  "arguments": {
    "action": "get_component",
    "componentName": "Button"
  }
}
```

### 📋 Available Actions (11 Total)

**Core Component Actions:**
- **`get_component`** - Get TypeScript source code for any Grafana UI component
- **`get_demo`** - Get Storybook demo files showing component usage
- **`list_components`** - List all available Grafana UI components
- **`get_metadata`** - Get component props, exports, and metadata
- **`get_directory`** - Browse the Grafana UI repository structure

**Advanced Grafana Actions:**
- **`get_documentation`** - Get rich MDX documentation with sections and examples
- **`get_stories`** - Get parsed Storybook stories with interactive controls
- **`get_tests`** - Get test files showing usage patterns and edge cases
- **`search`** - Search components by name and optionally by documentation content
- **`get_theme_tokens`** - Get Grafana design system tokens (colors, typography, spacing, etc.)
- **`get_dependencies`** - Get component dependency tree analysis (shallow or deep)

### ✨ Benefits of the Unified Tool

- **Simplified Integration**: Only one tool to configure in MCP clients
- **Easier for AI Agents**: Reduced cognitive load with single entry point
- **Better Context Management**: All functionality accessible through one interface
- **Parameter Validation**: Comprehensive validation based on action type
- **Future-Proof**: Easy to add new actions without breaking changes

### 🔄 Migration from Previous Versions

> **Breaking Change**: Version 2.0+ uses a unified tool interface. If you were using individual tools like `get_component`, `list_components`, etc., you now need to use the `grafana_ui` tool with an `action` parameter.

**Before (v1.x):**
```typescript
{ "tool": "get_component", "arguments": { "componentName": "Button" } }
```

**After (v2.0+):**
```typescript
{ "tool": "grafana_ui", "arguments": { "action": "get_component", "componentName": "Button" } }
```

All functionality remains the same - only the interface has changed.

## 📦 Quick Start

### ⚡ Using npx (Recommended)

The fastest way to get started - no installation required!

```bash
# Basic usage (rate limited to 60 requests/hour)
npx @shelldandy/grafana-ui-mcp-server

# With GitHub token for better rate limits (5000 requests/hour)
npx @shelldandy/grafana-ui-mcp-server --github-api-key ghp_your_token_here

# Short form
npx @shelldandy/grafana-ui-mcp-server -g ghp_your_token_here

# Using environment variable (either option works)
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
npx @shelldandy/grafana-ui-mcp-server

# Or using the common GITHUB_TOKEN variable
export GITHUB_TOKEN=ghp_your_token_here
npx @shelldandy/grafana-ui-mcp-server
```

**🎯 Try it now**: Run `npx @shelldandy/grafana-ui-mcp-server --help` to see all options!

### 🔧 Command Line Options

```bash
grafana-ui-mcp [options]

Options:
  --github-api-key, -g <token>     GitHub Personal Access Token
  --grafana-repo-path, -l <path>   Path to local Grafana repository (takes precedence)
  --help, -h                       Show help message
  --version, -v                    Show version information

Environment Variables:
  GITHUB_PERSONAL_ACCESS_TOKEN     Alternative way to provide GitHub token
  GITHUB_TOKEN                     Alternative way to provide GitHub token
  GRAFANA_REPO_PATH               Path to local Grafana repository

Examples:
  npx @shelldandy/grafana-ui-mcp-server --help
  npx @shelldandy/grafana-ui-mcp-server --version
  npx @shelldandy/grafana-ui-mcp-server -g ghp_1234567890abcdef
  npx @shelldandy/grafana-ui-mcp-server --grafana-repo-path /path/to/grafana
  npx @shelldandy/grafana-ui-mcp-server -l /path/to/grafana
  GITHUB_PERSONAL_ACCESS_TOKEN=ghp_token npx @shelldandy/grafana-ui-mcp-server
  GITHUB_TOKEN=ghp_token npx @shelldandy/grafana-ui-mcp-server
  GRAFANA_REPO_PATH=/path/to/grafana npx @shelldandy/grafana-ui-mcp-server
```

## 🔑 GitHub API Token Setup

**Why do you need a token?**

- Without token: Limited to 60 API requests per hour
- With token: Up to 5,000 requests per hour
- Better reliability and faster responses
- Access to the complete Grafana UI component library

### 📝 Getting Your Token (2 minutes)

1. **Go to GitHub Settings**:

   - Visit [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)

2. **Generate New Token**:

   - Click "Generate new token (classic)"
   - Add a note: "Grafana UI MCP server"
   - **Expiration**: Choose your preference (90 days recommended)
   - **Scopes**: ✅ **`public_repo`** (for optimal access to Grafana repository)

3. **Copy Your Token**:
   - Copy the generated token (starts with `ghp_`)
   - ⚠️ **Save it securely** - you won't see it again!

### 🚀 Using Your Token

**Method 1: Command Line (Quick testing)**

```bash
npx @shelldandy/grafana-ui-mcp-server --github-api-key ghp_your_token_here
```

**Method 2: Environment Variable (Recommended)**

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here

# Then simply run:
npx @shelldandy/grafana-ui-mcp-server
```

**Method 3: Claude Desktop Configuration**

```json
{
  "mcpServers": {
    "grafana-ui": {
      "command": "npx",
      "args": ["@shelldandy/grafana-ui-mcp-server"],
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
npx @shelldandy/grafana-ui-mcp-server --help

# Test with token (should show success message)
npx @shelldandy/grafana-ui-mcp-server --github-api-key ghp_your_token --help

# Check your current rate limit
curl -H "Authorization: token ghp_your_token" https://api.github.com/rate_limit
```

## 🏠 Local Development Support

**NEW**: Work with a local Grafana repository for faster development and access to uncommitted changes!

### 🎯 Why Use Local Repository?

- **⚡ Faster Access**: Direct filesystem reads, no network latency
- **🚫 No Rate Limits**: Unlimited component access
- **🔄 Real-time Updates**: See your local changes immediately
- **📡 Offline Support**: Works without internet connection
- **🧪 Development Workflow**: Test with modified/uncommitted components

### 🔧 Setup with Local Repository

1. **Clone the Grafana Repository**:
   ```bash
   git clone https://github.com/grafana/grafana.git
   cd grafana
   ```

2. **Use Local Path** (takes precedence over GitHub API):
   ```bash
   # Command line option
   npx @shelldandy/grafana-ui-mcp-server --grafana-repo-path /path/to/grafana
   npx @shelldandy/grafana-ui-mcp-server -l /path/to/grafana
   
   # Environment variable
   export GRAFANA_REPO_PATH=/path/to/grafana
   npx @shelldandy/grafana-ui-mcp-server
   ```

3. **Claude Desktop Configuration**:
   ```json
   {
     "mcpServers": {
       "grafana-ui": {
         "command": "npx",
         "args": ["@shelldandy/grafana-ui-mcp-server"],
         "env": {
           "GRAFANA_REPO_PATH": "/path/to/your/grafana/repository"
         }
       }
     }
   }
   ```

### 🔄 Configuration Priority

The server checks sources in this order:

1. **Local Repository** (`--grafana-repo-path` or `GRAFANA_REPO_PATH`)
2. **GitHub API with Token** (`--github-api-key` or `GITHUB_*_TOKEN`)
3. **GitHub API without Token** (rate limited to 60 requests/hour)

### 🛡️ Graceful Fallback

- If local file doesn't exist → Falls back to GitHub API automatically
- If local repository is invalid → Falls back to GitHub API with warning
- Source is indicated in tool responses (`"source": "local"` vs `"source": "github"`)

### ✅ Verify Local Setup

```bash
# Test local repository access
npx @shelldandy/grafana-ui-mcp-server --grafana-repo-path /path/to/grafana --help

# Should show: "Local Grafana repository configured: /path/to/grafana"
```

## 🛠️ Tool Usage Examples

The MCP server provides the unified `grafana_ui` tool for AI assistants:

### Basic Component Access

```typescript
// Get Button component source code
{
  "tool": "grafana_ui",
  "arguments": { 
    "action": "get_component",
    "componentName": "Button" 
  }
}

// List all available components
{
  "tool": "grafana_ui",
  "arguments": { 
    "action": "list_components"
  }
}

// Get component metadata and props
{
  "tool": "grafana_ui",
  "arguments": { 
    "action": "get_metadata",
    "componentName": "Alert" 
  }
}
```

### Advanced Documentation & Stories

```typescript
// Get rich MDX documentation for a component
{
  "tool": "grafana_ui",
  "arguments": { 
    "action": "get_documentation",
    "componentName": "Button" 
  }
}

// Get Storybook stories with interactive examples
{
  "tool": "grafana_ui",
  "arguments": { 
    "action": "get_stories",
    "componentName": "Input" 
  }
}

// Get test files showing usage patterns
{
  "tool": "grafana_ui",
  "arguments": { 
    "action": "get_tests",
    "componentName": "Modal" 
  }
}
```

### Search & Discovery

```typescript
// Search components by name
{
  "tool": "grafana_ui",
  "arguments": { 
    "action": "search",
    "query": "button" 
  }
}

// Search components including documentation content
{
  "tool": "grafana_ui",
  "arguments": {
    "action": "search",
    "query": "form validation",
    "includeDescription": true
  }
}
```

### Design System & Dependencies

```typescript
// Get all design system tokens
{
  "tool": "grafana_ui",
  "arguments": { 
    "action": "get_theme_tokens"
  }
}

// Get specific token category (colors, typography, spacing, etc.)
{
  "tool": "grafana_ui",
  "arguments": { 
    "action": "get_theme_tokens",
    "category": "colors" 
  }
}

// Get component dependencies (shallow)
{
  "tool": "grafana_ui",
  "arguments": { 
    "action": "get_dependencies",
    "componentName": "Button" 
  }
}

// Get deep dependency analysis
{
  "tool": "grafana_ui",
  "arguments": {
    "action": "get_dependencies",
    "componentName": "DataTable",
    "deep": true
  }
}
```

## 🔗 Claude Desktop Integration

Add to your Claude Desktop configuration (`~/.config/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "grafana-ui": {
      "command": "npx",
      "args": [
        "@shelldandy/grafana-ui-mcp-server",
        "--github-api-key",
        "ghp_your_token_here"
      ]
    }
  }
}
```

Or with environment variable:

```json
{
  "mcpServers": {
    "grafana-ui": {
      "command": "npx",
      "args": ["@shelldandy/grafana-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

## 🔗 Cursor Integration

Add to your Cursor configuration file. Access this through:

- **Windows/Linux**: `Ctrl+Shift+P` → "View: MCP Settings" → New MCP Server
- **macOS**: `Cmd+Shift+P` → "View: MCP Settings" → New MCP Server

### Method 1: With GitHub Token as Argument

```json
{
  "mcp": {
    "grafana-ui": {
      "command": "npx",
      "args": [
        "@shelldandy/grafana-ui-mcp-server",
        "--github-api-key",
        "ghp_your_token_here"
      ]
    }
  }
}
```

### Method 2: With Environment Variable (Recommended)

```json
{
  "mcp": {
    "grafana-ui": {
      "command": "npx",
      "args": ["@shelldandy/grafana-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

After adding the configuration, restart Cursor to enable the MCP server. You can then use the Grafana UI tools in your conversations with Cursor's AI assistant.

## 🏗️ Component Architecture

Grafana UI components follow a rich multi-file structure:

```
packages/grafana-ui/src/components/ComponentName/
├── ComponentName.tsx          # Main component implementation
├── ComponentName.mdx          # Rich documentation with examples
├── ComponentName.story.tsx    # Storybook stories and interactive examples
├── ComponentName.test.tsx     # Test files showing usage patterns
├── types.ts                   # TypeScript type definitions
├── utils.ts                   # Utility functions
└── styles.ts                  # Styling utilities (if applicable)
```

This server provides access to all these files, giving AI assistants comprehensive understanding of each component.

## 🔍 What's Covered

The server provides access to 200+ Grafana UI components including:

- **Input Components**: Button, Input, Checkbox, Radio, Select, Switch, Slider
- **Display Components**: Alert, Badge, Tag, Tooltip, Card, Panel, Stat
- **Layout Components**: Layout, Container, Stack, Grid, Divider
- **Navigation Components**: Menu, Breadcrumb, Tabs, Steps, Pagination
- **Data Components**: Table, DataTable, List, Tree, Timeline
- **Feedback Components**: Modal, Drawer, Notification, Spinner, Progress
- **Advanced Components**: DatePicker, CodeEditor, Graph, Chart components

Plus access to:

- **Design System Tokens**: Complete color palettes, typography scales, spacing system
- **Theme Files**: Light/dark mode configurations
- **Utility Functions**: Helper functions and shared utilities

## 🐛 Troubleshooting

### Common Issues

**"Rate limit exceeded" errors:**

```bash
# Solution: Add GitHub API token
npx @shelldandy/grafana-ui-mcp-server --github-api-key ghp_your_token_here
```

**"Component not found" errors:**

```bash
# Check available components first
# Use grafana_ui tool with action: "list_components" via your MCP client
# Component names are case-sensitive (e.g., "Button", not "button")
```

**"Command not found" errors:**

```bash
# Solution: Install Node.js 18+ and ensure npx is available
node --version  # Should be 18+
npx --version   # Should work
```

**Network/proxy issues:**

```bash
# Set proxy if needed
export HTTP_PROXY=http://your-proxy:8080
export HTTPS_PROXY=http://your-proxy:8080
npx @shelldandy/grafana-ui-mcp-server
```

### Debug Mode

Enable verbose logging:

```bash
# Set debug environment variable
DEBUG=* npx @shelldandy/grafana-ui-mcp-server --github-api-key ghp_your_token
```

## 🚀 Development

```bash
# Clone the repository
git clone https://github.com/shelldandy/grafana-ui-mcp-server.git
cd grafana-ui-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Test the package
npm run test
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

- 🐛 [Report Issues](https://github.com/shelldandy/grafana-ui-mcp-server/issues)
- 💬 [Discussions](https://github.com/shelldandy/grafana-ui-mcp-server/discussions)
- 📖 [Documentation](https://github.com/shelldandy/grafana-ui-mcp-server#readme)
- 📦 [npm Package](https://www.npmjs.com/package/@shelldandy/grafana-ui-mcp-server)

## 🔗 Related Projects

- [Grafana UI](https://github.com/grafana/grafana/tree/main/packages/grafana-ui) - The component library this server provides access to
- [Grafana](https://github.com/grafana/grafana) - The main Grafana repository
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol specification
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - Official MCP SDK

## ⭐ Acknowledgments

- [Grafana Team](https://github.com/grafana) for the amazing UI component library
- [Anthropic](https://anthropic.com) for the Model Context Protocol specification
- The open source community for inspiration and contributions

---

**Made with ❤️ by [shelldandy](https://github.com/shelldandy)**

**Star ⭐ this repo if you find it helpful!**
