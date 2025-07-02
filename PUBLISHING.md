# Publishing Checklist for shadcn-ui-mcp-server

## ✅ Pre-Publishing Checklist

- [x] Package name is unique and descriptive (`shadcn-ui-mcp-server`)
- [x] Version is set correctly (1.0.0)
- [x] License is included (MIT)
- [x] README.md is comprehensive and up-to-date
- [x] Binary (`shadcn-mcp`) is correctly configured in package.json
- [x] Main entry point is set correctly
- [x] Files array or .npmignore excludes unnecessary files
- [x] Keywords are relevant for discoverability
- [x] Repository URL is set (update with actual URL)
- [x] Author information is set (update with actual info)
- [x] Dependencies are correctly specified
- [x] Build script works (`npm run build`)
- [x] CLI help works (`./build/index.js --help`)
- [x] CLI version works (`./build/index.js --version`)
- [x] Test script passes (`npm test`)

## 📝 Before Publishing

1. **Update package.json with your info:**
   ```bash
   # Update these fields:
   - author: "Your Name <your.email@example.com>"
   - repository.url: "git+https://github.com/yourusername/shadcn-ui-mcp-server.git"
   - bugs.url: "https://github.com/yourusername/shadcn-ui-mcp-server/issues"
   - homepage: "https://github.com/yourusername/shadcn-ui-mcp-server#readme"
   ```

2. **Check package name availability:**
   ```bash
   npm view shadcn-ui-mcp-server
   # Should return "npm ERR! 404 Not Found" if available
   ```

3. **Final build and test:**
   ```bash
   npm run clean
   npm run build
   npm test
   ```

## 🚀 Publishing Steps

1. **Login to npm:**
   ```bash
   npm login
   ```

2. **Publish the package:**
   ```bash
   npm publish
   ```

3. **Test the published package:**
   ```bash
   npx shadcn-ui-mcp-server --help
   ```

## 🔄 Post-Publishing

1. **Update version for next release:**
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. **Create GitHub release (if using GitHub):**
   - Tag the release
   - Add release notes
   - Mention the npm package

## 📊 Usage Examples

After publishing, users can:

```bash
# Install globally
npm install -g shadcn-ui-mcp-server

# Or use with npx (recommended)
npx shadcn-ui-mcp-server --help
npx shadcn-ui-mcp-server --github-api-key YOUR_TOKEN
```

## 🎯 Integration Examples

**Claude Desktop:**
```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["shadcn-ui-mcp-server", "--github-api-key", "YOUR_TOKEN"]
    }
  }
}
```

**Continue.dev:**
```json
{
  "tools": [{
    "name": "shadcn-ui",
    "type": "mcp",
    "command": "npx",
    "args": ["shadcn-ui-mcp-server"],
    "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "YOUR_TOKEN"}
    // Or using GITHUB_TOKEN:
    "env": {"GITHUB_TOKEN": "YOUR_TOKEN"}
  }]
}
```
