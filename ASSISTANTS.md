## Project Overview

This is a **Model Context Protocol (MCP) server** for shadcn/ui v4 components. It provides AI assistants with access to shadcn/ui component source code, demos, blocks, and metadata through the MCP protocol.

- **Package**: `@shelldandy/shadcn-ui-mcp-server`
- **Runtime**: Node.js 18+ (ESM modules)
- **Language**: TypeScript with strict mode
- **Architecture**: MCP server using [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)

## Development Commands

```bash
# Build the project
npm run build

# Clean build artifacts
npm run clean

# Development build and run
npm run dev

# Start the server (requires build first)
npm run start

# Test the package (validates build and CLI)
npm run test

# Run examples
npm run examples
```

## Project Architecture

### Core Components

1. **Entry Point** (`src/index.ts`)

   - CLI argument parsing (`--github-api-key`, `--help`, `--version`)
   - MCP server initialization with stdio transport
   - GitHub API key configuration

2. **Handler System** (`src/handler.ts`)

   - Sets up MCP request handlers for resources, tools, and prompts
   - Validates tool parameters using Zod schemas
   - Global error handling and response formatting

3. **Tools Layer** (`src/tools.ts`)

   - Defines MCP tools available to AI clients
   - Tools: `get_component`, `get_component_demo`, `list_components`, `get_component_metadata`, `get_directory_structure`, `get_block`, `list_blocks`
   - Uses new MCP server approach with backward compatibility exports

4. **API Layer** (`src/utils/axios.ts`)
   - GitHub API integration with rate limiting
   - Caching system for API responses
   - Direct access to shadcn/ui v4 registry paths

### MCP Protocol Implementation

The server implements the Model Context Protocol to provide:

- **Tools**: Callable functions that fetch shadcn/ui data
- **Resources**: Static or dynamic content accessible via URI
- **Prompts**: Reusable prompt templates with parameters

### Data Sources

- **Primary**: GitHub API access to [shadcn-ui/ui](https://github.com/shadcn-ui/ui) repository
- **Registry Path**: `/apps/www/registry/new-york/` (v4 components)
- **Blocks Path**: `/apps/www/registry/new-york/blocks/` (v4 blocks)

## File Structure

```
src/
├── index.ts              # CLI entry point and server initialization
├── handler.ts            # MCP request handlers and validation
├── tools.ts              # Tool definitions and implementations
├── resources.ts          # Static MCP resources
├── prompts.ts            # MCP prompt templates
├── resource-templates.ts # Dynamic resource templates
├── schemas/
│   └── component.ts      # Zod schemas for validation
└── utils/
    ├── axios.ts          # GitHub API client with caching
    ├── api.ts            # Legacy API types (deprecated)
    └── cache.ts          # Response caching utilities
```

## Testing

- **Test Script**: `./test-package.sh` - Validates build, CLI, and package structure
- **No Unit Tests**: The project focuses on integration testing through the test script
- **Manual Testing**: Use `npm run examples` to test tool functionality

## Building and Publishing

```bash
# Prepare for publishing
npm run prepublishOnly

# This runs: clean → build → chmod +x build/index.js
```

The build process:

1. TypeScript compilation to `build/` directory
2. Makes the main entry point executable
3. Validates package structure for npm publishing

## Configuration

### GitHub API Integration

The server requires a GitHub API token for optimal performance:

- **Without token**: 60 requests/hour
- **With token**: 5,000 requests/hour

Configuration methods:

```bash
# Command line
--github-api-key ghp_your_token

# Environment variable (either option works)
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token
# Or using the common GITHUB_TOKEN variable
export GITHUB_TOKEN=ghp_your_token
```

### MCP Client Configuration

For Claude Desktop (`~/.config/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["@shelldandy/shadcn-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token"
        // Or using GITHUB_TOKEN:
        "GITHUB_TOKEN": "ghp_your_token"
      }
    }
  }
}
```

## Key Dependencies

- `@modelcontextprotocol/sdk`: MCP protocol implementation
- `axios`: HTTP client for GitHub API
- `cheerio`: HTML parsing (legacy, minimal usage)
- `zod`: Runtime type validation and schema definition

## Notes

- The project uses ESM modules (`"type": "module"` in package.json)
- All TypeScript compilation targets ES2022 with Node16 module resolution
- The `src/utils/api.ts` file contains legacy code that's deprecated in favor of direct GitHub API access
- Error handling follows MCP protocol standards with proper error codes and messages
