# Shadcn UI MCP Server

A TypeScript implementation of a Model Context Protocol (MCP) server designed to help AI assistants interact with shadcn/ui components. It allows AI models to fetch component source code, demos, and installation guides.

## Running with Docker / Podman

The recommended way to run this server is using Docker containers, managed with Docker Compose (or `podman-compose`).

**Server Modes:**
1.  **STDIO Server**: Communicates via standard input/output.
2.  **HTTP/SSE Server**: Communicates via HTTP and Server-Sent Events (ideal for web clients).

### Prerequisites

*   Docker: [Install Docker](https://docs.docker.com/get-docker/)
*   (Optional) Podman: [Install Podman](https://podman.io/getting-started/installation) (with `podman-compose`)

### Environment Variables

Configure the server using a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```
Modify `.env` as needed (e.g., `PORT` for the HTTP server, `GITHUB_PERSONAL_ACCESS_TOKEN`). Docker Compose automatically loads variables from this file.

### Using Docker Compose

The `compose.yaml` defines two services: `mcp-server-stdio` and `mcp-server-http`.

**1. Build Images:**
```bash
# Build all services
docker compose build

# Or a specific service (e.g., HTTP)
docker compose build mcp-server-http
```

**2. Run HTTP/SSE Server:**
```bash
# Start in detached mode
docker compose up -d mcp-server-http
```
*   Access: `http://localhost:3000` (SSE: `/sse`, Messages: `/messages`)
*   Port `3000` (host) maps to `3000` (container). `PORT` is also set in `compose.yaml`.

**3. Run STDIO Server:**
```bash
# Start in foreground
docker compose up mcp-server-stdio
```

**4. View Logs:**
```bash
docker compose logs -f mcp-server-http # Or mcp-server-stdio
```

**5. Stop Servers:**
```bash
docker compose stop mcp-server-http # Or mcp-server-stdio
# Stop and remove all services
docker compose down
```

## Features

This MCP server provides the following capabilities:

### Tools

1.  **`get_component`**:
    *   Retrieves the source code of a specified shadcn/ui component.
    *   Parameter: `componentName` (string) - e.g., "button".
    *   Returns: Component source code.

2.  **`get_component_demo`**:
    *   Fetches demo code for a shadcn/ui component.
    *   Parameter: `componentName` (string).
    *   Returns: Demo code.

### Resources

1.  **`resource:get_components`**:
    *   Lists all available shadcn/ui components.

### Resource Templates

1.  **`resource-template:get_install_script_for_component`**:
    *   Generates installation script for a component.
    *   Parameters: `packageManager` (string - npm, pnpm, yarn, bun), `component` (string).

2.  **`resource-template:get_installation_guide`**:
    *   Provides framework-specific installation guides for shadcn/ui.
    *   Parameters: `framework` (string - next, vite, etc.), `packageManager` (string).

## Additional Resources
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/introduction)
- [MCP Typescript SDK](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file)
- [Shadcn UI Documentation](https://ui.shadcn.com/)