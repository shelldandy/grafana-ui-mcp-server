#!/bin/bash

# Example usage script for grafana-ui-mcp-server
# This demonstrates different ways to use the package

echo "🚀 Grafana UI MCP Server - Usage Examples"
echo "======================================="
echo ""

# Basic usage
echo "1️⃣  Basic Usage (no GitHub token - rate limited):"
echo "   npx grafana-ui-mcp-server"
echo ""

# With GitHub token via argument
echo "2️⃣  With GitHub Token (command line):"
echo "   npx grafana-ui-mcp-server --github-api-key ghp_your_token_here"
echo "   npx grafana-ui-mcp-server -g ghp_your_token_here"
echo ""

# With environment variable
echo "3️⃣  With GitHub Token (environment variable):"
echo "   export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here"
echo "   npx grafana-ui-mcp-server"
echo ""
echo "   # Or using the common GITHUB_TOKEN variable:"
echo "   export GITHUB_TOKEN=ghp_your_token_here"
echo "   npx grafana-ui-mcp-server"
echo ""

# Claude Desktop integration
echo "4️⃣  Claude Desktop Integration:"
echo "   Add to ~/.config/Claude/claude_desktop_config.json:"
echo '   {'
echo '     "mcpServers": {'
echo '       "grafana-ui": {'
echo '         "command": "npx",'
echo '         "args": ["grafana-ui-mcp-server", "--github-api-key", "ghp_your_token"]'
echo '       }'
echo '     }'
echo '   }'
echo ""

# Continue.dev integration
echo "5️⃣  Continue.dev Integration:"
echo "   Add to .continue/config.json:"
echo '   {'
echo '     "tools": [{'
echo '       "name": "grafana-ui",'
echo '       "type": "mcp",'
echo '       "command": "npx",'
echo '       "args": ["grafana-ui-mcp-server"],'
echo '       "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token"}'
echo '       # Or using GITHUB_TOKEN:'
echo '       "env": {"GITHUB_TOKEN": "ghp_your_token"}'
echo '     }]'
echo '   }'
echo ""

# Available tools
echo "🛠️  Available Tools:"
echo "   • get_component         - Get Grafana UI component source code"
echo "   • get_component_demo    - Get component usage examples"
echo "   • list_components       - List all available Grafana UI components"
echo "   • get_component_metadata - Get component dependencies and metadata"
echo "   • get_directory_structure - Explore Grafana UI repository structure"
echo ""

echo "📚 For more information:"
echo "   npx grafana-ui-mcp-server --help"
echo "   https://github.com/shelldandy/grafana-ui-mcp-server"
