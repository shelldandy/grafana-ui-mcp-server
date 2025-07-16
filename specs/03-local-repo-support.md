# Local Grafana Repository Support Specification

## Overview

Add a new CLI option `--grafana-repo-path` (and equivalent environment variable `GRAFANA_REPO_PATH`) to allow users to specify a local Grafana repository path. This option takes precedence over GitHub API access, enabling the MCP server to read components directly from a local filesystem.

## Implementation Plan

### 1. CLI Interface Updates (`src/index.ts`)

**Add new CLI option:**
- `--grafana-repo-path <path>` / `-l <path>` - Path to local Grafana repository
- Environment variable: `GRAFANA_REPO_PATH`
- Update help text to document the new option
- Precedence: Local repo → GitHub API key → Unauthenticated GitHub

**Configuration logic:**
```typescript
const { githubApiKey, grafanaRepoPath } = await parseArgs();

if (grafanaRepoPath) {
  axios.setLocalGrafanaRepo(grafanaRepoPath);
  console.error("Local Grafana repository configured");
} else if (githubApiKey) {
  axios.setGitHubApiKey(githubApiKey);
  console.error("GitHub API key configured");
}
```

### 2. Core Utilities Enhancement (`src/utils/axios.ts`)

**Add local filesystem support:**
- New function: `setLocalGrafanaRepo(repoPath: string)`
- New internal flag: `localRepoPath: string | null`
- Update all existing functions to check local repo first before GitHub API
- Add filesystem utilities using Node.js `fs` module

**Function modifications:**
- `getComponentSource()` - Check local filesystem first
- `getComponentDemo()` - Read local `.story.tsx` files
- `getAvailableComponents()` - Use `fs.readdir()` on local components directory
- `getComponentMetadata()` - Parse local directory structure
- `getComponentDocumentation()` - Read local `.mdx` files
- `getComponentTests()` - Read local test files
- `searchComponents()` - Search local filesystem
- `getThemeFiles()` - Read local theme files
- `getComponentDependencies()` - Analyze local files
- `buildDirectoryTree()` - Build tree from local filesystem

**Path resolution:**
```typescript
const LOCAL_COMPONENTS_PATH = "packages/grafana-ui/src/components";
const resolveLocalPath = (subPath: string) => 
  path.join(localRepoPath!, subPath);
```

### 3. Error Handling & Validation

**Validation checks:**
- Verify local path exists and is readable
- Check if path contains expected Grafana structure (`packages/grafana-ui/src/components/`)
- Graceful fallback to GitHub API if local files are missing
- Clear error messages for invalid local repository paths

**Graceful degradation:**
- If local file doesn't exist, try GitHub API as fallback
- Maintain same error message format for consistency
- Log source (local vs GitHub) for debugging

### 4. Performance Optimizations

**Local filesystem advantages:**
- No rate limiting concerns
- Faster file access (no network latency)
- Support for modified/uncommitted components
- Real-time development workflow support

**Caching strategy:**
- Minimal caching needed for local files
- Optional file modification time checking
- Preserve existing GitHub API caching when used as fallback

### 5. Documentation Updates

**Help text updates:**
- Document new `--grafana-repo-path` option
- Explain precedence order (local → GitHub API → unauthenticated)
- Add usage examples for local development workflow
- Update environment variable documentation

**README.md updates:**
- New "Local Development" section
- Examples of local repository setup
- Benefits of local vs GitHub API access
- Troubleshooting section for local path issues

## Benefits

1. **Development Workflow**: Developers can work with local, potentially modified components
2. **No Rate Limits**: Unlimited access to components without GitHub API constraints
3. **Faster Access**: Direct filesystem reads are faster than HTTP requests
4. **Offline Support**: Works without internet connection
5. **Real-time Updates**: Reflects local changes immediately
6. **Backward Compatibility**: Existing GitHub API workflow remains unchanged

## Files to Modify

1. `specs/03-local-repo-support.md` - **NEW** - This specification document
2. `src/index.ts` - Add CLI argument parsing for `--grafana-repo-path` option
3. `src/utils/axios.ts` - Add filesystem support and local repo precedence logic
4. `README.md` - Document new local repository feature

## Success Criteria

- [ ] CLI accepts `--grafana-repo-path` option and `GRAFANA_REPO_PATH` environment variable
- [ ] All 11 MCP tools work with local repository path
- [ ] Graceful fallback to GitHub API when local files missing
- [ ] Path validation with clear error messages
- [ ] Maintains backward compatibility with existing GitHub API workflow
- [ ] Documentation updated with local development examples
- [ ] No breaking changes to existing functionality

## Implementation Details

### CLI Argument Parsing

```typescript
// In parseArgs() function
const grafanaRepoPathIndex = args.findIndex(
  (arg) => arg === "--grafana-repo-path" || arg === "-l",
);
let grafanaRepoPath = null;

if (grafanaRepoPathIndex !== -1 && args[grafanaRepoPathIndex + 1]) {
  grafanaRepoPath = args[grafanaRepoPathIndex + 1];
} else if (process.env.GRAFANA_REPO_PATH) {
  grafanaRepoPath = process.env.GRAFANA_REPO_PATH;
}

return { githubApiKey, grafanaRepoPath };
```

### Filesystem Functions

```typescript
// New filesystem utilities in axios.ts
import fs from 'fs';
import path from 'path';

let localRepoPath: string | null = null;

function setLocalGrafanaRepo(repoPath: string): void {
  // Validate path exists and has expected structure
  const componentsPath = path.join(repoPath, LOCAL_COMPONENTS_PATH);
  if (!fs.existsSync(componentsPath)) {
    throw new Error(`Invalid Grafana repository path: ${componentsPath} not found`);
  }
  localRepoPath = repoPath;
}

async function getComponentSourceLocal(componentName: string): Promise<string> {
  if (!localRepoPath) return null;
  const componentPath = path.join(localRepoPath, LOCAL_COMPONENTS_PATH, componentName, `${componentName}.tsx`);
  
  try {
    return fs.readFileSync(componentPath, 'utf8');
  } catch (error) {
    return null; // Fall back to GitHub API
  }
}
```

### Help Text Updates

```text
Options:
  --github-api-key, -g <token>     GitHub Personal Access Token for API access
  --grafana-repo-path, -l <path>   Path to local Grafana repository (takes precedence over GitHub API)
  --help, -h                       Show this help message
  --version, -v                    Show version information

Environment Variables:
  GITHUB_PERSONAL_ACCESS_TOKEN     Alternative way to provide GitHub token
  GITHUB_TOKEN                     Alternative way to provide GitHub token
  GRAFANA_REPO_PATH               Path to local Grafana repository

Examples:
  npx @shelldandy/grafana-ui-mcp-server
  npx @shelldandy/grafana-ui-mcp-server --github-api-key ghp_your_token_here
  npx @shelldandy/grafana-ui-mcp-server --grafana-repo-path /path/to/grafana
  npx @shelldandy/grafana-ui-mcp-server -l /path/to/grafana
```

## Testing Strategy

1. **Unit Testing**: Test filesystem functions with mock filesystem
2. **Integration Testing**: Test with actual local Grafana repository
3. **Fallback Testing**: Verify GitHub API fallback when local files missing
4. **Error Handling**: Test invalid paths and missing files
5. **Backward Compatibility**: Ensure existing GitHub workflow unaffected