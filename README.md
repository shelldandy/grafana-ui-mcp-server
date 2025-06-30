# Grafana UI MCP Server

[![npm version](https://badge.fury.io/js/@jpisnice%2Fgrafana-ui-mcp-server.svg)](https://badge.fury.io/js/@jpisnice/grafana-ui-mcp-server)
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

## 📋 Available Tools (11 Total)

### Core Component Tools (5)

- **`get_component`** - Get TypeScript source code for any Grafana UI component
- **`get_component_demo`** - Get Storybook demo files showing component usage
- **`list_components`** - List all available Grafana UI components
- **`get_component_metadata`** - Get component props, exports, and metadata
- **`get_directory_structure`** - Browse the Grafana UI repository structure

### Advanced Grafana Tools (6) 

- **`get_component_documentation`** - Get rich MDX documentation with sections and examples
- **`get_component_stories`** - Get parsed Storybook stories with interactive controls
- **`get_component_tests`** - Get test files showing usage patterns and edge cases
- **`search_components`** - Search components by name and optionally by documentation content
- **`get_theme_tokens`** - Get Grafana design system tokens (colors, typography, spacing, etc.)
- **`get_component_dependencies`** - Get component dependency tree analysis (shallow or deep)

## 📦 Quick Start

### ⚡ Using npx (Recommended)

The fastest way to get started - no installation required!

```bash
# Basic usage (rate limited to 60 requests/hour)
npx @jpisnice/grafana-ui-mcp-server

# With GitHub token for better rate limits (5000 requests/hour)
npx @jpisnice/grafana-ui-mcp-server --github-api-key ghp_your_token_here

# Short form
npx @jpisnice/grafana-ui-mcp-server -g ghp_your_token_here

# Using environment variable
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
npx @jpisnice/grafana-ui-mcp-server
```

**🎯 Try it now**: Run `npx @jpisnice/grafana-ui-mcp-server --help` to see all options!

### 🔧 Command Line Options

```bash
grafana-ui-mcp [options]

Options:
  --github-api-key, -g <token>    GitHub Personal Access Token
  --help, -h                      Show help message  
  --version, -v                   Show version information

Environment Variables:
  GITHUB_PERSONAL_ACCESS_TOKEN    Alternative way to provide GitHub token

Examples:
  npx @jpisnice/grafana-ui-mcp-server --help
  npx @jpisnice/grafana-ui-mcp-server --version
  npx @jpisnice/grafana-ui-mcp-server -g ghp_1234567890abcdef
  GITHUB_PERSONAL_ACCESS_TOKEN=ghp_token npx @jpisnice/grafana-ui-mcp-server
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
npx @jpisnice/grafana-ui-mcp-server --github-api-key ghp_your_token_here
```

**Method 2: Environment Variable (Recommended)**
```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here

# Then simply run:
npx @jpisnice/grafana-ui-mcp-server
```

**Method 3: Claude Desktop Configuration**
```json
{
  "mcpServers": {
    "grafana-ui": {
      "command": "npx",
      "args": ["@jpisnice/grafana-ui-mcp-server"],
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
npx @jpisnice/grafana-ui-mcp-server --help

# Test with token (should show success message)
npx @jpisnice/grafana-ui-mcp-server --github-api-key ghp_your_token --help

# Check your current rate limit
curl -H "Authorization: token ghp_your_token" https://api.github.com/rate_limit
```

## 🛠️ Tool Usage Examples

The MCP server provides these tools for AI assistants:

### Basic Component Access

```typescript
// Get Button component source code
{
  "tool": "get_component",
  "arguments": { "componentName": "Button" }
}

// List all available components
{
  "tool": "list_components",
  "arguments": {}
}

// Get component metadata and props
{
  "tool": "get_component_metadata", 
  "arguments": { "componentName": "Alert" }
}
```

### Advanced Documentation & Stories

```typescript
// Get rich MDX documentation for a component
{
  "tool": "get_component_documentation",
  "arguments": { "componentName": "Button" }
}

// Get Storybook stories with interactive examples
{
  "tool": "get_component_stories",
  "arguments": { "componentName": "Input" }
}

// Get test files showing usage patterns
{
  "tool": "get_component_tests",
  "arguments": { "componentName": "Modal" }
}
```

### Search & Discovery

```typescript
// Search components by name
{
  "tool": "search_components",
  "arguments": { "query": "button" }
}

// Search components including documentation content
{
  "tool": "search_components",
  "arguments": { 
    "query": "form validation", 
    "includeDescription": true 
  }
}
```

### Design System & Dependencies

```typescript
// Get all design system tokens
{
  "tool": "get_theme_tokens",
  "arguments": {}
}

// Get specific token category (colors, typography, spacing, etc.)
{
  "tool": "get_theme_tokens",
  "arguments": { "category": "colors" }
}

// Get component dependencies (shallow)
{
  "tool": "get_component_dependencies",
  "arguments": { "componentName": "Button" }
}

// Get deep dependency analysis
{
  "tool": "get_component_dependencies",
  "arguments": { 
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
      "args": ["@jpisnice/grafana-ui-mcp-server", "--github-api-key", "ghp_your_token_here"]
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
      "args": ["@jpisnice/grafana-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

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
npx @jpisnice/grafana-ui-mcp-server --github-api-key ghp_your_token_here
```

**"Component not found" errors:**
```bash
# Check available components first
# Use list_components tool via your MCP client
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
npx @jpisnice/grafana-ui-mcp-server
```

### Debug Mode

Enable verbose logging:

```bash
# Set debug environment variable
DEBUG=* npx @jpisnice/grafana-ui-mcp-server --github-api-key ghp_your_token
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
- 📦 [npm Package](https://www.npmjs.com/package/@jpisnice/grafana-ui-mcp-server)

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