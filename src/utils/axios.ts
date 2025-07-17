import { Axios } from "axios";
import fs from "fs";
import path from "path";

// Constants for the Grafana UI repository structure
const REPO_OWNER = "grafana";
const REPO_NAME = "grafana";
const REPO_BRANCH = "main";
const GRAFANA_UI_BASE_PATH = "packages/grafana-ui/src";
const COMPONENTS_PATH = `${GRAFANA_UI_BASE_PATH}/components`;

// Local repository configuration
let localRepoPath: string | null = null;

// GitHub API for accessing repository structure and metadata
const githubApi = new Axios({
  baseURL: "https://api.github.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
    "User-Agent": "Mozilla/5.0 (compatible; GrafanaUiMcpServer/1.0.0)",
    ...((process.env.GITHUB_PERSONAL_ACCESS_TOKEN ||
      process.env.GITHUB_TOKEN) && {
      Authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN}`,
    }),
  },
  timeout: 30000, // Increased from 15000 to 30000 (30 seconds)
  transformResponse: [
    (data) => {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    },
  ],
});

// GitHub Raw for directly fetching file contents
const githubRaw = new Axios({
  baseURL: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}`,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; GrafanaUiMcpServer/1.0.0)",
  },
  timeout: 30000, // Increased from 15000 to 30000 (30 seconds)
  transformResponse: [(data) => data], // Return raw data
});

/**
 * Set local Grafana repository path
 * @param repoPath Path to local Grafana repository
 */
function setLocalGrafanaRepo(repoPath: string): void {
  // Validate path exists and has expected structure
  const componentsPath = path.join(repoPath, COMPONENTS_PATH);
  if (!fs.existsSync(componentsPath)) {
    throw new Error(
      `Invalid Grafana repository path: ${componentsPath} not found. ` +
      `Expected Grafana repository structure with ${COMPONENTS_PATH} directory.`
    );
  }
  
  // Additional validation - check for at least one component directory
  try {
    const componentDirs = fs.readdirSync(componentsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (componentDirs.length === 0) {
      throw new Error(
        `No component directories found in ${componentsPath}. ` +
        `Expected Grafana UI component structure.`
      );
    }
  } catch (error: any) {
    throw new Error(
      `Cannot read components directory ${componentsPath}: ${error.message}`
    );
  }

  localRepoPath = repoPath;
  console.log(`Local Grafana repository configured: ${repoPath}`);
}

/**
 * Get component source from local filesystem
 * @param componentName Name of the component
 * @returns Promise with component source code or null if not found locally
 */
async function getComponentSourceLocal(componentName: string): Promise<string | null> {
  if (!localRepoPath) return null;
  
  const componentPath = path.join(localRepoPath, COMPONENTS_PATH, componentName, `${componentName}.tsx`);
  
  try {
    return fs.readFileSync(componentPath, 'utf8');
  } catch (error) {
    return null; // Fall back to GitHub API
  }
}

/**
 * Fetch component source code from Grafana UI
 * @param componentName Name of the component (e.g., "Button", "Alert")
 * @returns Promise with component source code
 */
async function getComponentSource(componentName: string): Promise<string> {
  // Try local filesystem first
  const localSource = await getComponentSourceLocal(componentName);
  if (localSource !== null) {
    return localSource;
  }

  // Fall back to GitHub API
  const componentPath = `${COMPONENTS_PATH}/${componentName}/${componentName}.tsx`;

  try {
    const response = await githubRaw.get(`/${componentPath}`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Component "${componentName}" not found in ${localRepoPath ? 'local repository or ' : ''}Grafana UI repository`,
    );
  }
}

/**
 * Get component demo from local filesystem
 * @param componentName Name of the component
 * @returns Promise with component demo code or null if not found locally
 */
async function getComponentDemoLocal(componentName: string): Promise<string | null> {
  if (!localRepoPath) return null;
  
  const storyPath = path.join(localRepoPath, COMPONENTS_PATH, componentName, `${componentName}.story.tsx`);
  
  try {
    return fs.readFileSync(storyPath, 'utf8');
  } catch (error) {
    return null; // Fall back to GitHub API
  }
}

/**
 * Fetch component story/example from Grafana UI
 * @param componentName Name of the component
 * @returns Promise with component story code
 */
async function getComponentDemo(componentName: string): Promise<string> {
  // Try local filesystem first
  const localDemo = await getComponentDemoLocal(componentName);
  if (localDemo !== null) {
    return localDemo;
  }

  // Fall back to GitHub API
  const storyPath = `${COMPONENTS_PATH}/${componentName}/${componentName}.story.tsx`;

  try {
    const response = await githubRaw.get(`/${storyPath}`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Story for component "${componentName}" not found in ${localRepoPath ? 'local repository or ' : ''}Grafana UI repository`,
    );
  }
}

/**
 * Get available components from local filesystem
 * @returns Promise with list of component names or null if not available locally
 */
async function getAvailableComponentsLocal(): Promise<string[] | null> {
  if (!localRepoPath) return null;
  
  const componentsPath = path.join(localRepoPath, COMPONENTS_PATH);
  
  try {
    const items = fs.readdirSync(componentsPath, { withFileTypes: true });
    return items
      .filter(item => item.isDirectory())
      .map(item => item.name)
      .sort();
  } catch (error) {
    return null; // Fall back to GitHub API
  }
}

/**
 * Fetch all available components from Grafana UI
 * @returns Promise with list of component names
 */
async function getAvailableComponents(): Promise<string[]> {
  // Try local filesystem first
  const localComponents = await getAvailableComponentsLocal();
  if (localComponents !== null) {
    return localComponents;
  }

  // Fall back to GitHub API
  try {
    const response = await githubApi.get(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${COMPONENTS_PATH}`,
    );
    return response.data
      .filter((item: any) => item.type === "dir")
      .map((item: any) => item.name);
  } catch (error) {
    throw new Error(
      `Failed to fetch available components from ${localRepoPath ? 'local repository or ' : ''}Grafana UI`
    );
  }
}

/**
 * Get component metadata from local filesystem
 * @param componentName Name of the component
 * @returns Promise with component metadata or null if not available locally
 */
async function getComponentMetadataLocal(componentName: string): Promise<any | null> {
  if (!localRepoPath) return null;
  
  const componentPath = path.join(localRepoPath, COMPONENTS_PATH, componentName);
  
  try {
    const items = fs.readdirSync(componentPath, { withFileTypes: true });
    const files = items
      .filter(item => item.isFile())
      .map(item => item.name);

    // Basic metadata from file structure
    return {
      name: componentName,
      type: "grafana-ui-component",
      source: "local",
      files: files,
      hasImplementation: files.includes(`${componentName}.tsx`),
      hasStories: files.some((file) => file.endsWith(".story.tsx")),
      hasDocumentation: files.includes(`${componentName}.mdx`),
      hasTests: files.some((file) => file.endsWith(".test.tsx")),
      hasTypes: files.includes("types.ts"),
      hasUtils: files.includes("utils.ts"),
      hasStyles: files.includes("styles.ts"),
      totalFiles: files.length,
    };
  } catch (error) {
    return null; // Fall back to GitHub API
  }
}

/**
 * Fetch component files and extract basic metadata from Grafana UI
 * @param componentName Name of the component
 * @returns Promise with component metadata
 */
async function getComponentMetadata(componentName: string): Promise<any> {
  // Try local filesystem first
  const localMetadata = await getComponentMetadataLocal(componentName);
  if (localMetadata !== null) {
    return localMetadata;
  }

  // Fall back to GitHub API
  try {
    // Get the component directory contents
    const response = await githubApi.get(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${COMPONENTS_PATH}/${componentName}`,
    );

    if (!Array.isArray(response.data)) {
      return null;
    }

    const files = response.data.map((item: any) => item.name);

    // Basic metadata from file structure
    return {
      name: componentName,
      type: "grafana-ui-component",
      source: "github",
      files: files,
      hasImplementation: files.includes(`${componentName}.tsx`),
      hasStories: files.some((file) => file.endsWith(".story.tsx")),
      hasDocumentation: files.includes(`${componentName}.mdx`),
      hasTests: files.some((file) => file.endsWith(".test.tsx")),
      hasTypes: files.includes("types.ts"),
      hasUtils: files.includes("utils.ts"),
      hasStyles: files.includes("styles.ts"),
      totalFiles: files.length,
    };
  } catch (error) {
    console.error(`Error getting metadata for ${componentName}:`, error);
    return null;
  }
}

/**
 * Recursively builds a directory tree structure from a GitHub repository
 * @param owner Repository owner
 * @param repo Repository name
 * @param path Path within the repository to start building the tree from
 * @param branch Branch name
 * @returns Promise resolving to the directory tree structure
 */
async function buildDirectoryTree(
  owner: string = REPO_OWNER,
  repo: string = REPO_NAME,
  path: string = COMPONENTS_PATH,
  branch: string = REPO_BRANCH,
): Promise<any> {
  try {
    const response = await githubApi.get(
      `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    );

    if (!response.data) {
      throw new Error("No data received from GitHub API");
    }

    const contents = response.data;

    // Handle different response types from GitHub API
    if (!Array.isArray(contents)) {
      // Check if it's an error response (like rate limit)
      if (contents.message) {
        if (contents.message.includes("rate limit exceeded")) {
          throw new Error(
            `GitHub API rate limit exceeded. ${contents.message} Consider setting GITHUB_PERSONAL_ACCESS_TOKEN or GITHUB_TOKEN environment variable for higher rate limits.`,
          );
        } else if (contents.message.includes("Not Found")) {
          throw new Error(
            `Path not found: ${path}. The path may not exist in the repository.`,
          );
        } else {
          throw new Error(`GitHub API error: ${contents.message}`);
        }
      }

      // If contents is not an array, it might be a single file
      if (contents.type === "file") {
        return {
          path: contents.path,
          type: "file",
          name: contents.name,
          url: contents.download_url,
          sha: contents.sha,
        };
      } else {
        throw new Error(
          `Unexpected response type from GitHub API: ${JSON.stringify(contents)}`,
        );
      }
    }

    // Build tree node for this level (directory with multiple items)
    const result: Record<string, any> = {
      path,
      type: "directory",
      children: {},
    };

    // Process each item
    for (const item of contents) {
      if (item.type === "file") {
        // Add file to this directory's children
        result.children[item.name] = {
          path: item.path,
          type: "file",
          name: item.name,
          url: item.download_url,
          sha: item.sha,
        };
      } else if (item.type === "dir") {
        // Recursively process subdirectory (limit depth to avoid infinite recursion)
        if (path.split("/").length < 8) {
          try {
            const subTree = await buildDirectoryTree(
              owner,
              repo,
              item.path,
              branch,
            );
            result.children[item.name] = subTree;
          } catch (error) {
            console.warn(`Failed to fetch subdirectory ${item.path}:`, error);
            result.children[item.name] = {
              path: item.path,
              type: "directory",
              error: "Failed to fetch contents",
            };
          }
        }
      }
    }

    return result;
  } catch (error: any) {
    console.error(`Error building directory tree for ${path}:`, error);

    // Check if it's already a well-formatted error from above
    if (
      error.message &&
      (error.message.includes("rate limit") ||
        error.message.includes("GitHub API error"))
    ) {
      throw error;
    }

    // Provide more specific error messages for HTTP errors
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      const message = responseData?.message || "Unknown error";

      if (status === 404) {
        throw new Error(
          `Path not found: ${path}. The path may not exist in the repository.`,
        );
      } else if (status === 403) {
        if (message.includes("rate limit")) {
          throw new Error(
            `GitHub API rate limit exceeded: ${message} Consider setting GITHUB_PERSONAL_ACCESS_TOKEN or GITHUB_TOKEN environment variable for higher rate limits.`,
          );
        } else {
          throw new Error(`Access forbidden: ${message}`);
        }
      } else if (status === 401) {
        throw new Error(
          `Authentication failed. Please check your GITHUB_PERSONAL_ACCESS_TOKEN or GITHUB_TOKEN if provided.`,
        );
      } else {
        throw new Error(`GitHub API error (${status}): ${message}`);
      }
    }

    throw error;
  }
}

/**
 * Provides a basic directory structure for Grafana UI components without API calls
 * This is used as a fallback when API rate limits are hit
 */
function getBasicGrafanaUIStructure(): any {
  return {
    path: COMPONENTS_PATH,
    type: "directory",
    note: "Basic structure provided due to API limitations",
    description: "Grafana UI components directory",
    children: {
      Button: {
        path: `${COMPONENTS_PATH}/Button`,
        type: "directory",
        description: "Button component with variants and sizes",
        files: [
          "Button.tsx",
          "Button.mdx",
          "Button.story.tsx",
          "Button.test.tsx",
        ],
      },
      Alert: {
        path: `${COMPONENTS_PATH}/Alert`,
        type: "directory",
        description: "Alert component for notifications",
        files: ["Alert.tsx", "Alert.mdx", "Alert.test.tsx"],
      },
      Input: {
        path: `${COMPONENTS_PATH}/Input`,
        type: "directory",
        description: "Input components for forms",
        files: ["Input.tsx", "Input.mdx", "Input.story.tsx"],
      },
    },
  };
}

/**
 * Enhanced buildDirectoryTree with fallback for rate limits
 */
async function buildDirectoryTreeWithFallback(
  owner: string = REPO_OWNER,
  repo: string = REPO_NAME,
  path: string = COMPONENTS_PATH,
  branch: string = REPO_BRANCH,
): Promise<any> {
  try {
    return await buildDirectoryTree(owner, repo, path, branch);
  } catch (error: any) {
    // If it's a rate limit error and we're asking for the default components path, provide fallback
    if (
      error.message &&
      error.message.includes("rate limit") &&
      path === COMPONENTS_PATH
    ) {
      console.warn("Using fallback directory structure due to rate limit");
      return getBasicGrafanaUIStructure();
    }
    // Re-throw other errors
    throw error;
  }
}

/**
 * Get component documentation from local filesystem
 * @param componentName Name of the component
 * @returns Promise with component documentation or null if not found locally
 */
async function getComponentDocumentationLocal(componentName: string): Promise<string | null> {
  if (!localRepoPath) return null;
  
  const docPath = path.join(localRepoPath, COMPONENTS_PATH, componentName, `${componentName}.mdx`);
  
  try {
    return fs.readFileSync(docPath, 'utf8');
  } catch (error) {
    return null; // Fall back to GitHub API
  }
}

/**
 * Fetch component documentation from Grafana UI
 * @param componentName Name of the component
 * @returns Promise with component MDX documentation
 */
async function getComponentDocumentation(
  componentName: string,
): Promise<string> {
  // Try local filesystem first
  const localDocs = await getComponentDocumentationLocal(componentName);
  if (localDocs !== null) {
    return localDocs;
  }

  // Fall back to GitHub API
  const docPath = `${COMPONENTS_PATH}/${componentName}/${componentName}.mdx`;

  try {
    const response = await githubRaw.get(`/${docPath}`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Documentation for component "${componentName}" not found in ${localRepoPath ? 'local repository or ' : ''}Grafana UI repository`,
    );
  }
}

/**
 * Get component files from Grafana UI directory
 * @param componentName Name of the component
 * @returns Promise with all component files
 */
async function getComponentFiles(componentName: string): Promise<any> {
  try {
    const response = await githubApi.get(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${COMPONENTS_PATH}/${componentName}`,
    );

    if (!Array.isArray(response.data)) {
      throw new Error(`Component directory "${componentName}" not found`);
    }

    const componentFiles: any = {
      name: componentName,
      path: `${COMPONENTS_PATH}/${componentName}`,
      files: {},
    };

    // Fetch each file's content
    for (const item of response.data) {
      if (item.type === "file") {
        try {
          const fileResponse = await githubRaw.get(`/${item.path}`);
          componentFiles.files[item.name] = {
            name: item.name,
            content: fileResponse.data,
            size: fileResponse.data.length,
            path: item.path,
          };
        } catch (error) {
          // If individual file fails, mark it as unavailable
          componentFiles.files[item.name] = {
            name: item.name,
            content: null,
            error: "Failed to fetch file content",
            path: item.path,
          };
        }
      }
    }

    return componentFiles;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error(
        `Component "${componentName}" not found in Grafana UI repository.`,
      );
    }
    throw error;
  }
}

/**
 * Set or update GitHub API key for higher rate limits
 * @param apiKey GitHub Personal Access Token
 */
function setGitHubApiKey(apiKey: string): void {
  // Update the Authorization header for the GitHub API instance
  if (apiKey && apiKey.trim()) {
    (githubApi.defaults.headers as any)["Authorization"] =
      `Bearer ${apiKey.trim()}`;
    console.log("GitHub API key updated successfully");
  } else {
    // Remove authorization header if empty key provided
    delete (githubApi.defaults.headers as any)["Authorization"];
    console.log("GitHub API key removed - using unauthenticated requests");
  }
}

/**
 * Get current GitHub API rate limit status
 * @returns Promise with rate limit information
 */
async function getGitHubRateLimit(): Promise<any> {
  try {
    const response = await githubApi.get("/rate_limit");
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to get rate limit info: ${error.message}`);
  }
}

/**
 * Get component tests from local filesystem
 * @param componentName Name of the component
 * @returns Promise with component test code or null if not found locally
 */
async function getComponentTestsLocal(componentName: string): Promise<string | null> {
  if (!localRepoPath) return null;
  
  const testPath = path.join(localRepoPath, COMPONENTS_PATH, componentName, `${componentName}.test.tsx`);
  
  try {
    return fs.readFileSync(testPath, 'utf8');
  } catch (error) {
    return null; // Fall back to GitHub API
  }
}

/**
 * Fetch component test files from Grafana UI
 * @param componentName Name of the component
 * @returns Promise with component test code
 */
async function getComponentTests(componentName: string): Promise<string> {
  // Try local filesystem first
  const localTests = await getComponentTestsLocal(componentName);
  if (localTests !== null) {
    return localTests;
  }

  // Fall back to GitHub API
  const testPath = `${COMPONENTS_PATH}/${componentName}/${componentName}.test.tsx`;

  try {
    const response = await githubRaw.get(`/${testPath}`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Tests for component "${componentName}" not found in ${localRepoPath ? 'local repository or ' : ''}Grafana UI repository`,
    );
  }
}

/**
 * Search components by name and description
 * @param query Search query string
 * @param includeDescription Whether to search in documentation content
 * @returns Promise with filtered component list
 */
async function searchComponents(
  query: string,
  includeDescription: boolean = false,
): Promise<any[]> {
  try {
    const components = await getAvailableComponents();
    const queryLower = query.toLowerCase();

    const filteredComponents = [];

    for (const component of components) {
      let matches = false;

      // Check component name
      if (component.toLowerCase().includes(queryLower)) {
        matches = true;
      }

      // Check description if requested
      if (!matches && includeDescription) {
        try {
          const metadata = await getComponentMetadata(component);
          if (metadata) {
            // Check if documentation exists and search in it
            if (metadata.hasDocumentation) {
              try {
                const docs = await getComponentDocumentation(component);
                if (docs.toLowerCase().includes(queryLower)) {
                  matches = true;
                }
              } catch (error) {
                // Ignore documentation fetch errors for search
              }
            }
          }
        } catch (error) {
          // Ignore metadata fetch errors for search
        }
      }

      if (matches) {
        filteredComponents.push({
          name: component,
          relevance:
            component.toLowerCase() === queryLower
              ? 1.0
              : component.toLowerCase().startsWith(queryLower)
                ? 0.8
                : 0.5,
        });
      }
    }

    // Sort by relevance
    return filteredComponents.sort((a, b) => b.relevance - a.relevance);
  } catch (error) {
    throw new Error(
      `Failed to search components: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Get theme files from local filesystem
 * @param category Optional category filter
 * @returns Promise with theme files or null if not available locally
 */
async function getThemeFilesLocal(category?: string): Promise<any | null> {
  if (!localRepoPath) return null;
  
  const themePaths = [
    "packages/grafana-ui/src/themes/light.ts",
    "packages/grafana-ui/src/themes/dark.ts", 
    "packages/grafana-ui/src/themes/base.ts",
    "packages/grafana-ui/src/themes/default.ts",
  ];

  const themeFiles: any = {
    category: category || "all",
    source: "local",
    themes: {},
  };

  let foundAny = false;

  for (const themePath of themePaths) {
    try {
      const fullPath = path.join(localRepoPath, themePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const themeName = themePath.split("/").pop()?.replace(".ts", "") || "unknown";
      themeFiles.themes[themeName] = content;
      foundAny = true;
    } catch (error) {
      // Theme file doesn't exist locally, skip it
    }
  }

  return foundAny ? themeFiles : null;
}

/**
 * Fetch Grafana theme files
 * @param category Optional category filter (colors, typography, spacing, etc.)
 * @returns Promise with theme file content
 */
async function getThemeFiles(category?: string): Promise<any> {
  // Try local filesystem first
  const localThemes = await getThemeFilesLocal(category);
  if (localThemes !== null) {
    return localThemes;
  }

  // Fall back to GitHub API
  const themePaths = [
    "packages/grafana-ui/src/themes/light.ts",
    "packages/grafana-ui/src/themes/dark.ts",
    "packages/grafana-ui/src/themes/base.ts",
    "packages/grafana-ui/src/themes/default.ts",
  ];

  const themeFiles: any = {
    category: category || "all",
    source: "github",
    themes: {},
  };

  for (const themePath of themePaths) {
    try {
      const response = await githubRaw.get(`/${themePath}`);
      const themeName =
        themePath.split("/").pop()?.replace(".ts", "") || "unknown";
      themeFiles.themes[themeName] = response.data;
    } catch (error) {
      // Theme file doesn't exist, skip it
      console.warn(`Theme file not found: ${themePath}`);
    }
  }

  return themeFiles;
}

/**
 * Get component dependencies by analyzing imports
 * @param componentName Name of the component
 * @param deep Whether to analyze dependencies recursively
 * @returns Promise with dependency tree
 */
async function getComponentDependencies(
  componentName: string,
  deep: boolean = false,
): Promise<any> {
  try {
    const componentSource = await getComponentSource(componentName);

    // Extract imports from component source
    const importRegex = /import\s+.*?\s+from\s+['"]([@\w\/\-\.]+)['"]/g;
    const dependencies: any = {
      component: componentName,
      dependencies: {
        external: [],
        internal: [],
        grafanaUI: [],
      },
      deep: deep,
    };

    let match;
    while ((match = importRegex.exec(componentSource)) !== null) {
      const dep = match[1];

      if (dep.startsWith("@grafana/ui")) {
        dependencies.dependencies.grafanaUI.push(dep);
      } else if (dep.startsWith("./") || dep.startsWith("../")) {
        dependencies.dependencies.internal.push(dep);
      } else if (!dep.startsWith("@/")) {
        dependencies.dependencies.external.push(dep);
      }
    }

    // Remove duplicates
    dependencies.dependencies.external = [
      ...new Set(dependencies.dependencies.external),
    ];
    dependencies.dependencies.internal = [
      ...new Set(dependencies.dependencies.internal),
    ];
    dependencies.dependencies.grafanaUI = [
      ...new Set(dependencies.dependencies.grafanaUI),
    ];

    // If deep analysis requested, analyze internal dependencies
    if (deep && dependencies.dependencies.internal.length > 0) {
      dependencies.deepDependencies = {};

      for (const internalDep of dependencies.dependencies.internal) {
        try {
          // Convert relative path to component name
          const depComponentName = internalDep
            .replace(/^\.\//, "")
            .replace(/\.tsx?$/, "");
          if (depComponentName && depComponentName !== componentName) {
            dependencies.deepDependencies[depComponentName] =
              await getComponentDependencies(depComponentName, false);
          }
        } catch (error) {
          // Ignore errors for individual dependencies
          dependencies.deepDependencies[internalDep] = {
            error: "Failed to analyze dependency",
          };
        }
      }
    }

    return dependencies;
  } catch (error) {
    throw new Error(
      `Failed to analyze dependencies for component "${componentName}": ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
export const axios = {
  githubRaw,
  githubApi,
  buildDirectoryTree: buildDirectoryTreeWithFallback, // Use fallback version by default
  buildDirectoryTreeWithFallback,
  getComponentSource,
  getComponentDemo,
  getAvailableComponents,
  getComponentMetadata,
  getComponentDocumentation,
  getComponentFiles,
  getComponentTests,
  searchComponents,
  getThemeFiles,
  getComponentDependencies,
  setGitHubApiKey,
  setLocalGrafanaRepo,
  getGitHubRateLimit,
  // Path constants for easy access
  paths: {
    REPO_OWNER,
    REPO_NAME,
    REPO_BRANCH,
    GRAFANA_UI_BASE_PATH,
    COMPONENTS_PATH,
  },
};
