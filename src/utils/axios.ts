import { Axios } from "axios";

const shadcn = new Axios({
    baseURL: "https://ui.shadcn.com/docs",
    headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; ShadcnUiMcpServer/0.1.0)",
    },
    timeout: 10000,
})

const githubDirectories=["/ui","/blocks","/charts","/hooks","/lib"]

// Add GitHub API endpoint for repository contents
const githubApi = new Axios({
    baseURL: "https://api.github.com",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json",
        "User-Agent": "Mozilla/5.0 (compatible; ShadcnUiMcpServer/0.1.0)",
    },
    timeout: 10000,
});

const githubRaw = new Axios({
    baseURL: "https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4",
    headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; ShadcnUiMcpServer/0.1.0)",
    },
    timeout: 10000,
});

/**
 * Recursively builds a directory tree structure from a GitHub repository
 * @param owner Repository owner
 * @param repo Repository name
 * @param path Path within the repository to start building the tree from
 * @param branch Branch name
 * @returns Promise resolving to the directory tree structure
 */
async function buildDirectoryTree(
    owner: string = 'shadcn-ui', 
    repo: string = 'ui', 
    path: string = 'apps/v4/registry/new-york-v4', 
    branch: string = 'main'
): Promise<any> {
    try {
        const response = await githubApi.get(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
        
        if (!response.data) {
            throw new Error('No data received from GitHub API');
        }

        // Parse response data
        const contents = JSON.parse(response.data);
        
        // Build tree node for this level
        const result: Record<string, any> = {
            path,
            type: 'directory',
            children: {},
        };

        // Process each item
        for (const item of contents) {
            if (item.type === 'file') {
                // Add file to this directory's children
                result.children[item.name] = {
                    path: item.path,
                    type: 'file',
                    name: item.name,
                    url: item.download_url,
                    sha: item.sha,
                };
            } else if (item.type === 'dir') {
                // Recursively process subdirectory
                const subTree = await buildDirectoryTree(owner, repo, item.path, branch);
                result.children[item.name] = subTree;
            }
        }

        return result;
    } catch (error) {
        console.error(`Error building directory tree for ${path}:`, error);
        throw error;
    }
}

export const axios = {
    shadcn,
    githubRaw,
    githubDirectories,
    githubApi,
    buildDirectoryTree
}